export interface CreateProjectDto {
  name: string;
  description?: string;
  status?: string;
  color?: string;
  dueDate?: string;
  ownerId: number;
  members?: number[];
}

export interface UpdateProjectDto {
  name?: string;
  description?: string;
  status?: string;
  color?: string;
  dueDate?: string | null;
}

export interface CreateTaskDto {
  name: string;
  description?: string;
  status?: string;
  priority?: string;
  dueDate?: string;
  projectId?: number;
  assigneeId?: number;
  sprintId?: number;
  comments?: number;
  attachments?: number;
}

export interface UpdateTaskDto {
  name?: string;
  description?: string;
  status?: string;
  priority?: string;
  dueDate?: string | null;
  projectId?: number | null;
  assigneeId?: number | null;
  sprintId?: number | null;
  comments?: number;
  attachments?: number;
}

export interface CreateSprintDto {
  name: string;
  status?: string;
  startDate: string;
  endDate: string;
  projectId: number;
  members?: number[];
}

export interface UpdateSprintDto {
  name?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}

export interface CreateCommitmentDto {
  title: string;
  description?: string;
  date: string;
  startTime: string;
  endTime: string;
  location?: string;
  status?: string;
  priority?: string;
  reminder?: string;
  projectId?: number;
  participants?: number[];
}

export interface UpdateCommitmentDto {
  title?: string;
  description?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  location?: string | null;
  status?: string;
  priority?: string;
  reminder?: string | null;
  projectId?: number | null;
}

export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
  password?: string;
}

