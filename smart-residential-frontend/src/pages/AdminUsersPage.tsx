import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { userApi } from "@/services/userService";
import { roleApi } from "@/services/roleService";
import { technicianApi } from "@/services/technicianService";
import { residentApi } from "@/services/residentService";
import { apartmentApi } from "@/services/apartmentService";
import { useAuth } from "@/context/AuthContext";
import type { User } from "@/types";

const schema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  roleId: z.coerce.number().positive("Select a role"),
});

const residentSchema = z.object({
  userId: z.coerce.number().positive(),
  apartmentId: z.coerce.number().positive(),
  movedInAt: z.string().optional(),
});

type Form = z.infer<typeof schema>;
type ResidentForm = z.infer<typeof residentSchema>;

export default function AdminUsersPage() {
  const qc = useQueryClient();
  const { tenantId, userId: currentUserId } = useAuth();
  const [open, setOpen] = useState(false);
  const [residentOpen, setResidentOpen] = useState(false);

  const usersQ = useQuery({ queryKey: ["users"], queryFn: userApi.list });
  const rolesQ = useQuery({ queryKey: ["roles"], queryFn: roleApi.list });
  const apartmentsQ = useQuery({ queryKey: ["apartments"], queryFn: apartmentApi.list });
  const residentsQ = useQuery({ queryKey: ["residents"], queryFn: residentApi.list });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Form>({ resolver: zodResolver(schema) });
  const residentForm = useForm<ResidentForm>({ resolver: zodResolver(residentSchema) });

  const createM = useMutation({
    mutationFn: userApi.create,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["users"] });
      toast.success("User created");
      setOpen(false);
      reset();
    },
  });

  const deactivateM = useMutation({
    mutationFn: userApi.deactivate,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });

  const activateM = useMutation({
    mutationFn: userApi.activate,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });

  const staffM = useMutation({
    mutationFn: userApi.makeStaff,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["users"] });
      toast.success("Role updated to staff");
    },
  });

  const techM = useMutation({
    mutationFn: async (userId: number) => {
      const user = await userApi.makeTechnician(userId);
      const technicians = await technicianApi.list();
      const hasProfile = technicians.some((technician) => technician.userId === userId);

      if (!hasProfile) {
        await technicianApi.create({
          userId,
          specialization: "General maintenance",
          isAvailable: true,
        });
      }

      return user;
    },
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: ["users"] }),
        qc.invalidateQueries({ queryKey: ["technicians"] }),
        qc.invalidateQueries({ queryKey: ["technicians", "available"] }),
      ]);
      toast.success("Role updated to technician");
    },
  });

  const residentM = useMutation({
    mutationFn: async (values: ResidentForm) => {
      if (values.userId === currentUserId) {
        throw new Error("You cannot link your own account as a resident.");
      }

      const selectedUser = usersQ.data?.find((user) => user.id === values.userId);
      if (!selectedUser || !isResidentRole(selectedUser.roleId)) {
        throw new Error("Only users with the resident role can be linked to an apartment.");
      }

      const hasProfile = residentsQ.data?.some((resident) => resident.userId === values.userId);

      if (!hasProfile) {
        await residentApi.create({
          userId: values.userId,
          apartmentId: values.apartmentId,
          movedInAt: values.movedInAt ? new Date(values.movedInAt).toISOString() : undefined,
        });
      }
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Resident link failed");
    },
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: ["users"] }),
        qc.invalidateQueries({ queryKey: ["residents"] }),
      ]);
      toast.success("Resident linked to apartment");
      setResidentOpen(false);
      residentForm.reset();
    },
  });

  const roleName = (id: number) => rolesQ.data?.find((r) => r.id === id)?.name ?? `role:${id}`;
  const normalizedRoleName = (id: number) => roleName(id).trim().toUpperCase();
  const isStaffRole = (id: number) => normalizedRoleName(id) === "ROLE_STAFF";
  const isTechnicianRole = (id: number) => normalizedRoleName(id) === "ROLE_TECHNICIAN";
  const isResidentRole = (id: number) => normalizedRoleName(id) === "ROLE_RESIDENT";
  const hasResidentProfile = (userId: number) =>
    Boolean(residentsQ.data?.some((resident) => resident.userId === userId));

  const userLabel = (userId: number) => {
    const user = usersQ.data?.find((u) => u.id === userId);
    return user ? `${user.firstName ?? ""} ${user.lastName ?? ""} (${user.email})`.trim() : `User #${userId}`;
  };

  const apartmentLabel = (apartmentId: number) => {
    const apartment = apartmentsQ.data?.find((a) => a.id === apartmentId);
    return apartment ? `Unit ${apartment.unitNumber} (building ${apartment.buildingId})` : `Apartment #${apartmentId}`;
  };

  const openResidentModal = (userId: number) => {
    if (userId === currentUserId) {
      toast.error("You cannot link your own account as a resident.");
      return;
    }

    residentForm.reset({
      userId,
      apartmentId: apartmentsQ.data?.[0]?.id ?? 0,
      movedInAt: "",
    });
    setResidentOpen(true);
  };

  const onSubmit = (values: Form) => {
    if (!tenantId) {
      toast.error("The organization identifier is missing from this session. Sign out and sign in again.");
      return;
    }
    createM.mutate({ ...values, tenantId });
  };

  return (
    <div>
      <PageHeader
        title="Users"
        description="Manage accounts and roles. Admins only."
        action={
          <Button
            onClick={() => {
              reset({ roleId: rolesQ.data?.[0]?.id ?? 1, email: "", password: "", firstName: "", lastName: "" });
              setOpen(true);
            }}
          >
            Invite user
          </Button>
        }
      />
      <Card padding="p-0" className="overflow-hidden">
        {usersQ.isLoading ? (
          <div className="flex justify-center py-16">
            <Spinner />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-sm">
              <thead className="bg-slate-50/80 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-6 py-3">User</th>
                  <th className="px-6 py-3">Role</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {(usersQ.data ?? []).map((u: User) => (
                  <tr key={u.id}>
                    <td className="px-6 py-4">
                      <div className="font-medium text-secondary">{u.email}</div>
                      <div className="text-xs text-slate-500">
                        {u.firstName} {u.lastName}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{roleName(u.roleId)}</td>
                    <td className="px-6 py-4">
                      <Badge tone={u.isActive ? "success" : "warning"}>{u.isActive ? "Active" : "Inactive"}</Badge>
                    </td>
                    <td className="space-x-1 px-6 py-4 text-right">
                      {u.id === currentUserId ? null : (
                        <>
                          {u.isActive ? (
                            <Button variant="ghost" className="!px-2 !py-1 text-xs" onClick={() => deactivateM.mutate(u.id)}>
                              Deactivate
                            </Button>
                          ) : (
                            <Button variant="ghost" className="!px-2 !py-1 text-xs" onClick={() => activateM.mutate(u.id)}>
                              Activate
                            </Button>
                          )}
                          {!isStaffRole(u.roleId) ? (
                            <Button
                              variant="ghost"
                              className="!px-2 !py-1 text-xs"
                              loading={staffM.isPending && staffM.variables === u.id}
                              onClick={() => staffM.mutate(u.id)}
                            >
                              Make staff
                            </Button>
                          ) : null}
                          {!isTechnicianRole(u.roleId) ? (
                            <Button
                              variant="ghost"
                              className="!px-2 !py-1 text-xs"
                              loading={techM.isPending && techM.variables === u.id}
                              onClick={() => techM.mutate(u.id)}
                            >
                              Make technician
                            </Button>
                          ) : null}
                          {isResidentRole(u.roleId) && !hasResidentProfile(u.id) ? (
                            <Button
                              variant="ghost"
                              className="!px-2 !py-1 text-xs"
                              onClick={() => openResidentModal(u.id)}
                            >
                              Link resident
                            </Button>
                          ) : null}
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal open={open} onClose={() => setOpen(false)} title="Create user (admin)">
        <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Email</label>
            <Input type="email" {...register("email")} />
            {errors.email ? <p className="mt-1 text-xs text-red-600">{errors.email.message}</p> : null}
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Temporary password</label>
            <Input type="password" {...register("password")} />
            {errors.password ? <p className="mt-1 text-xs text-red-600">{errors.password.message}</p> : null}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">First name</label>
              <Input {...register("firstName")} />
              {errors.firstName ? <p className="mt-1 text-xs text-red-600">{errors.firstName.message}</p> : null}
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Last name</label>
              <Input {...register("lastName")} />
              {errors.lastName ? <p className="mt-1 text-xs text-red-600">{errors.lastName.message}</p> : null}
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Role</label>
            <select className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" {...register("roleId")}>
              {(rolesQ.data ?? []).map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
            {errors.roleId ? <p className="mt-1 text-xs text-red-600">{errors.roleId.message}</p> : null}
          </div>
          <Button type="submit" className="w-full" loading={createM.isPending}>
            Create
          </Button>
        </form>
      </Modal>

      <Modal open={residentOpen} onClose={() => setResidentOpen(false)} title="Link resident">
        <form className="space-y-4" onSubmit={residentForm.handleSubmit((values) => residentM.mutate(values))}>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">User</label>
            <select
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm"
              {...residentForm.register("userId")}
            >
              {(usersQ.data ?? []).map((u) => (
                <option key={u.id} value={u.id}>
                  {userLabel(u.id)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Apartment</label>
            <select
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm"
              {...residentForm.register("apartmentId")}
            >
              {(apartmentsQ.data ?? []).map((apartment) => (
                <option key={apartment.id} value={apartment.id}>
                  {apartmentLabel(apartment.id)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Move-in (optional)</label>
            <input
              type="datetime-local"
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm"
              {...residentForm.register("movedInAt")}
            />
          </div>
          <Button type="submit" className="w-full" loading={residentM.isPending}>
            Save
          </Button>
        </form>
      </Modal>
    </div>
  );
}
