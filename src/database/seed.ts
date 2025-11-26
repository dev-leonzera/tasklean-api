import 'reflect-metadata';
import { AppDataSource } from '../config/database';
import { User } from '../entities/User';
import { Project } from '../entities/Project';
import { ProjectMember } from '../entities/ProjectMember';
import { Task } from '../entities/Task';
import { Sprint } from '../entities/Sprint';
import { SprintMember } from '../entities/SprintMember';
import { Commitment } from '../entities/Commitment';
import { CommitmentParticipant } from '../entities/CommitmentParticipant';

async function seed() {
  try {
    await AppDataSource.initialize();
    console.log('🌱 Seeding database...');

    const userRepository = AppDataSource.getRepository(User);
    const projectRepository = AppDataSource.getRepository(Project);
    const projectMemberRepository = AppDataSource.getRepository(ProjectMember);
    const taskRepository = AppDataSource.getRepository(Task);
    const sprintRepository = AppDataSource.getRepository(Sprint);
    const sprintMemberRepository = AppDataSource.getRepository(SprintMember);
    const commitmentRepository = AppDataSource.getRepository(Commitment);
    const commitmentParticipantRepository = AppDataSource.getRepository(CommitmentParticipant);

    // Criar usuários
    let user1 = await userRepository.findOne({ where: { email: 'admin@tasklean.com' } });
    if (!user1) {
      user1 = userRepository.create({
        email: 'admin@tasklean.com',
        name: 'Admin',
        password: 'admin123', // Em produção, deve ser hash
      });
      user1 = await userRepository.save(user1);
    }

    let user2 = await userRepository.findOne({ where: { email: 'dev@tasklean.com' } });
    if (!user2) {
      user2 = userRepository.create({
        email: 'dev@tasklean.com',
        name: 'Dev',
        password: 'dev123', // Em produção, deve ser hash
      });
      user2 = await userRepository.save(user2);
    }

    let user3 = await userRepository.findOne({ where: { email: 'designer@tasklean.com' } });
    if (!user3) {
      user3 = userRepository.create({
        email: 'designer@tasklean.com',
        name: 'Designer',
        password: 'designer123', // Em produção, deve ser hash
      });
      user3 = await userRepository.save(user3);
    }

    console.log('✅ Users created');

    // Criar projetos
    let project1 = await projectRepository.findOne({ where: { name: 'Sistema de Gestão' } });
    if (!project1) {
      project1 = projectRepository.create({
        name: 'Sistema de Gestão',
        description: 'Desenvolvimento do sistema principal de gestão',
        status: 'progress',
        color: '#3B82F6',
        dueDate: new Date('2024-12-31'),
        ownerId: user1.id,
      });
      project1 = await projectRepository.save(project1);

      // Adicionar membros
      const member1 = projectMemberRepository.create({
        projectId: project1.id,
        userId: user2.id,
      });
      const member2 = projectMemberRepository.create({
        projectId: project1.id,
        userId: user3.id,
      });
      await projectMemberRepository.save([member1, member2]);
    }

    let project2 = await projectRepository.findOne({ where: { name: 'App Mobile' } });
    if (!project2) {
      project2 = projectRepository.create({
        name: 'App Mobile',
        description: 'Aplicativo mobile para iOS e Android',
        status: 'starting',
        color: '#10B981',
        dueDate: new Date('2024-11-30'),
        ownerId: user1.id,
      });
      project2 = await projectRepository.save(project2);

      const member3 = projectMemberRepository.create({
        projectId: project2.id,
        userId: user2.id,
      });
      await projectMemberRepository.save(member3);
    }

    console.log('✅ Projects created');

    // Criar tarefas
    const tasksCount = await taskRepository.count();
    if (tasksCount === 0) {
      const tasks = [
        {
          name: 'Configurar banco de dados',
          description: 'Configurar TypeORM e SQLite',
          status: 'done',
          priority: 'high',
          projectId: project1.id,
          assigneeId: user2.id,
          comments: 2,
          attachments: 1,
        },
        {
          name: 'Criar API REST',
          description: 'Implementar endpoints da API',
          status: 'progress',
          priority: 'high',
          projectId: project1.id,
          assigneeId: user2.id,
          comments: 5,
          attachments: 0,
        },
        {
          name: 'Design do sistema',
          description: 'Criar mockups e protótipos',
          status: 'review',
          priority: 'medium',
          projectId: project1.id,
          assigneeId: user3.id,
          comments: 3,
          attachments: 4,
        },
        {
          name: 'Configurar ambiente',
          description: 'Preparar ambiente de desenvolvimento',
          status: 'todo',
          priority: 'low',
          projectId: project2.id,
          assigneeId: user2.id,
          comments: 0,
          attachments: 0,
        },
      ];

      for (const taskData of tasks) {
        const task = taskRepository.create(taskData);
        await taskRepository.save(task);
      }
    }

    console.log('✅ Tasks created');

    // Criar sprints
    let sprint1 = await sprintRepository.findOne({ where: { name: 'Sprint 1 - Fundação' } });
    if (!sprint1) {
      sprint1 = sprintRepository.create({
        name: 'Sprint 1 - Fundação',
        status: 'active',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-14'),
        projectId: project1.id,
      });
      sprint1 = await sprintRepository.save(sprint1);

      const sprintMembers = [
        { sprintId: sprint1.id, userId: user1.id },
        { sprintId: sprint1.id, userId: user2.id },
        { sprintId: sprint1.id, userId: user3.id },
      ];

      for (const memberData of sprintMembers) {
        const member = sprintMemberRepository.create(memberData);
        await sprintMemberRepository.save(member);
      }
    }

    console.log('✅ Sprints created');

    // Criar compromissos
    const commitmentsCount = await commitmentRepository.count();
    if (commitmentsCount === 0) {
      const commitment1 = commitmentRepository.create({
        title: 'Daily Standup',
        description: 'Reunião diária do time',
        date: new Date('2024-01-15'),
        startTime: '09:00',
        endTime: '09:30',
        status: 'scheduled',
        priority: 'high',
        projectId: project1.id,
      });
      const savedCommitment1 = await commitmentRepository.save(commitment1);

      const participants1 = [
        { commitmentId: savedCommitment1.id, userId: user1.id },
        { commitmentId: savedCommitment1.id, userId: user2.id },
        { commitmentId: savedCommitment1.id, userId: user3.id },
      ];

      for (const participantData of participants1) {
        const participant = commitmentParticipantRepository.create(participantData);
        await commitmentParticipantRepository.save(participant);
      }

      const commitment2 = commitmentRepository.create({
        title: 'Sprint Planning',
        description: 'Planejamento da próxima sprint',
        date: new Date('2024-01-20'),
        startTime: '14:00',
        endTime: '16:00',
        location: 'Sala de Reuniões',
        status: 'scheduled',
        priority: 'high',
        projectId: project1.id,
      });
      const savedCommitment2 = await commitmentRepository.save(commitment2);

      const participants2 = [
        { commitmentId: savedCommitment2.id, userId: user1.id },
        { commitmentId: savedCommitment2.id, userId: user2.id },
      ];

      for (const participantData of participants2) {
        const participant = commitmentParticipantRepository.create(participantData);
        await commitmentParticipantRepository.save(participant);
      }
    }

    console.log('✅ Commitments created');
    console.log('🎉 Seeding completed!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await AppDataSource.destroy();
  }
}

seed();

