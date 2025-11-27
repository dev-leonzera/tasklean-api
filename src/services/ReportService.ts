import { AppDataSource } from '../config/database';
import { Task } from '../entities/Task';
import { User } from '../entities/User';

interface ReportStats {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  todoTasks: number;
  productivity: number;
  averageTime: string;
  bugRate: number;
  monthlyData: { month: string; tasks: number }[];
  statusData: { name: string; value: number; color: string }[];
  teamPerformance: {
    name: string;
    avatar: string;
    tasks: number;
    completion: number;
  }[];
}

export class ReportService {
  private taskRepository = AppDataSource.getRepository(Task);
  private userRepository = AppDataSource.getRepository(User);

  private getInitials(name: string): string {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  private formatMonth(date: Date): string {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return months[date.getMonth()];
  }

  async generateReportStats(daysFilter: number = 30): Promise<ReportStats> {
    // Buscar todas as tarefas e usuários
    const [tasks, users] = await Promise.all([
      this.taskRepository.find({
        relations: ['assignee', 'project'],
        order: { createdAt: 'DESC' },
      }),
      this.userRepository.find({
        select: ['id', 'name', 'email'],
      }),
    ]);

    // Filtrar tarefas pelo período
    const now = new Date();
    const filterDate = new Date(now);
    filterDate.setDate(filterDate.getDate() - daysFilter);

    const filteredTasks = tasks.filter(task => {
      if (!task.createdAt) return false;
      const taskDate = new Date(task.createdAt);
      return taskDate >= filterDate;
    });

    // Calcular estatísticas básicas
    const totalTasks = filteredTasks.length;
    const completedTasks = filteredTasks.filter(t => t.status === 'done' || t.status === 'completed').length;
    const inProgressTasks = filteredTasks.filter(t => t.status === 'in_progress' || t.status === 'progress').length;
    const todoTasks = filteredTasks.filter(t => t.status === 'todo' || t.status === 'pending').length;

    // Calcular produtividade (percentual de tarefas concluídas)
    const productivity = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Calcular tempo médio (estimado baseado em dias desde criação até atualização)
    let totalDays = 0;
    let tasksWithDates = 0;
    filteredTasks.forEach(task => {
      if (task.createdAt && task.updatedAt && task.status === 'done') {
        const created = new Date(task.createdAt);
        const updated = new Date(task.updatedAt);
        const days = (updated.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
        if (days > 0) {
          totalDays += days;
          tasksWithDates++;
        }
      }
    });
    const avgDays = tasksWithDates > 0 ? totalDays / tasksWithDates : 0;
    const averageTime = avgDays > 0 ? `${avgDays.toFixed(1)}d` : '0h';

    // Calcular taxa de bugs (tarefas com prioridade alta e status não concluído)
    const bugTasks = filteredTasks.filter(
      t => t.priority === 'high' && t.status !== 'done' && t.status !== 'completed'
    ).length;
    const bugRate = totalTasks > 0 ? Number(((bugTasks / totalTasks) * 100).toFixed(1)) : 0;

    // Agrupar tarefas por mês (últimos 5 meses)
    const monthlyMap = new Map<string, number>();
    const monthsToShow = 5;
    for (let i = monthsToShow - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setMonth(date.getMonth() - i);
      const monthKey = `${this.formatMonth(date)} ${date.getFullYear()}`;
      monthlyMap.set(monthKey, 0);
    }

    filteredTasks.forEach(task => {
      if (task.createdAt) {
        const taskDate = new Date(task.createdAt);
        const monthKey = `${this.formatMonth(taskDate)} ${taskDate.getFullYear()}`;
        if (monthlyMap.has(monthKey)) {
          monthlyMap.set(monthKey, (monthlyMap.get(monthKey) || 0) + 1);
        }
      }
    });

    const monthlyData = Array.from(monthlyMap.entries()).map(([month, tasks]) => ({
      month: month.split(' ')[0], // Apenas o nome do mês
      tasks,
    }));

    // Dados do gráfico de pizza (status)
    const statusData = [
      { name: 'Concluído', value: completedTasks, color: '#10B981' },
      { name: 'Em Progresso', value: inProgressTasks, color: '#F59E0B' },
      { name: 'A Fazer', value: todoTasks, color: '#6B7280' },
    ];

    // Performance do time
    const userTaskMap = new Map<number, { total: number; completed: number; name: string }>();
    
    users.forEach(user => {
      userTaskMap.set(user.id, { total: 0, completed: 0, name: user.name });
    });

    filteredTasks.forEach(task => {
      if (task.assigneeId) {
        const userStats = userTaskMap.get(task.assigneeId);
        if (userStats) {
          userStats.total++;
          if (task.status === 'done' || task.status === 'completed') {
            userStats.completed++;
          }
        }
      }
    });

    const teamPerformance = Array.from(userTaskMap.values())
      .filter(user => user.total > 0)
      .map(user => ({
        name: user.name,
        avatar: this.getInitials(user.name),
        tasks: user.total,
        completion: user.total > 0 ? Math.round((user.completed / user.total) * 100) : 0,
      }))
      .sort((a, b) => b.tasks - a.tasks)
      .slice(0, 4); // Top 4 membros

    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      todoTasks,
      productivity,
      averageTime,
      bugRate,
      monthlyData,
      statusData,
      teamPerformance,
    };
  }
}

