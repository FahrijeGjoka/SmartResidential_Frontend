import { api } from "./api";
import type { CommentRequest, CommentResponse } from "@/types";

export const commentApi = {
  list: (issueId: number) =>
    api.get<CommentResponse[]>(`/api/issues/${issueId}/comments`).then((r) => r.data),
  create: (issueId: number, body: CommentRequest) =>
    api.post<CommentResponse>(`/api/issues/${issueId}/comments`, body).then((r) => r.data),
  remove: (issueId: number, commentId: number) =>
    api.delete(`/api/issues/${issueId}/comments/${commentId}`),
};
