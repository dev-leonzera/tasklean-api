import { Request, Response, NextFunction } from 'express';
import PDFDocument from 'pdfkit';
import { ReportService } from '../services/ReportService';

const reportService = new ReportService();

export class ReportsController {
  async exportPDF(req: Request, res: Response, next: NextFunction) {
    try {
      const daysFilter = req.query.days ? parseInt(req.query.days as string) : 30;

      // Gerar estatísticas
      const stats = await reportService.generateReportStats(daysFilter);

      // Criar documento PDF
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 50, bottom: 50, left: 50, right: 50 },
      });

      // Configurar headers da resposta
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="relatorio-tasklean-${new Date().toISOString().split('T')[0]}.pdf"`
      );

      // Pipe do PDF para a resposta
      doc.pipe(res);

      // Cabeçalho
      doc
        .fontSize(24)
        .fillColor('#1F2937')
        .text('Relatório TaskLean', { align: 'center' })
        .moveDown(0.5);

      doc
        .fontSize(12)
        .fillColor('#6B7280')
        .text(`Período: Últimos ${daysFilter} dias`, { align: 'center' })
        .text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, { align: 'center' })
        .moveDown(1);

      // Estatísticas principais
      doc
        .fontSize(18)
        .fillColor('#1F2937')
        .text('Estatísticas Principais', { underline: true })
        .moveDown(0.5);

      doc.fontSize(11).fillColor('#374151');

      const statsY = doc.y;
      const statsWidth = (doc.page.width - 100) / 4;

      // Tarefas Totais
      doc
        .rect(50, statsY, statsWidth - 10, 60)
        .stroke('#E5E7EB')
        .fillColor('#1F2937')
        .fontSize(10)
        .text('Tarefas Totais', 55, statsY + 5, { width: statsWidth - 20, align: 'center' })
        .fontSize(20)
        .font('Helvetica-Bold')
        .text(stats.totalTasks.toString(), 55, statsY + 20, { width: statsWidth - 20, align: 'center' })
        .font('Helvetica')
        .fontSize(8)
        .fillColor('#6B7280')
        .text('No período selecionado', 55, statsY + 45, { width: statsWidth - 20, align: 'center' });

      // Produtividade
      doc
        .rect(50 + statsWidth, statsY, statsWidth - 10, 60)
        .stroke('#E5E7EB')
        .fillColor('#1F2937')
        .fontSize(10)
        .text('Produtividade', 55 + statsWidth, statsY + 5, { width: statsWidth - 20, align: 'center' })
        .fontSize(20)
        .font('Helvetica-Bold')
        .text(`${stats.productivity}%`, 55 + statsWidth, statsY + 20, { width: statsWidth - 20, align: 'center' })
        .font('Helvetica')
        .fontSize(8)
        .fillColor('#6B7280')
        .text('Tarefas concluídas', 55 + statsWidth, statsY + 45, { width: statsWidth - 20, align: 'center' });

      // Tempo Médio
      doc
        .rect(50 + statsWidth * 2, statsY, statsWidth - 10, 60)
        .stroke('#E5E7EB')
        .fillColor('#1F2937')
        .fontSize(10)
        .text('Tempo Médio', 55 + statsWidth * 2, statsY + 5, { width: statsWidth - 20, align: 'center' })
        .fontSize(20)
        .font('Helvetica-Bold')
        .text(stats.averageTime, 55 + statsWidth * 2, statsY + 20, { width: statsWidth - 20, align: 'center' })
        .font('Helvetica')
        .fontSize(8)
        .fillColor('#6B7280')
        .text('Para conclusão', 55 + statsWidth * 2, statsY + 45, { width: statsWidth - 20, align: 'center' });

      // Taxa de Bugs
      doc
        .rect(50 + statsWidth * 3, statsY, statsWidth - 10, 60)
        .stroke('#E5E7EB')
        .fillColor('#1F2937')
        .fontSize(10)
        .text('Taxa de Bugs', 55 + statsWidth * 3, statsY + 5, { width: statsWidth - 20, align: 'center' })
        .fontSize(20)
        .font('Helvetica-Bold')
        .text(`${stats.bugRate}%`, 55 + statsWidth * 3, statsY + 20, { width: statsWidth - 20, align: 'center' })
        .font('Helvetica')
        .fontSize(8)
        .fillColor('#6B7280')
        .text('Alta prioridade pendente', 55 + statsWidth * 3, statsY + 45, { width: statsWidth - 20, align: 'center' });

      doc.y = statsY + 70;
      doc.moveDown(1);

      // Status das Tarefas
      doc
        .fontSize(18)
        .fillColor('#1F2937')
        .text('Status das Tarefas', { underline: true })
        .moveDown(0.5);

      doc.fontSize(11).fillColor('#374151');

      stats.statusData.forEach((item, index) => {
        const y = doc.y;
        doc
          .rect(50, y, 20, 15)
          .fill(item.color)
          .fillColor('#1F2937')
          .fontSize(11)
          .text(item.name, 75, y + 2)
          .text(`${item.value} tarefas`, { align: 'right' });
        doc.moveDown(0.5);
      });

      doc.moveDown(1);

      // Performance do Time
      if (stats.teamPerformance.length > 0) {
        doc
          .fontSize(18)
          .fillColor('#1F2937')
          .text('Performance do Time', { underline: true })
          .moveDown(0.5);

        doc.fontSize(11).fillColor('#374151');

        stats.teamPerformance.forEach((member) => {
          const y = doc.y;
          
          // Avatar
          doc
            .circle(70, y + 10, 10)
            .fill('#3B82F6')
            .fillColor('#FFFFFF')
            .fontSize(10)
            .font('Helvetica-Bold')
            .text(member.avatar, 60, y + 5, { width: 20, align: 'center' });

          // Nome e estatísticas
          doc
            .fillColor('#1F2937')
            .font('Helvetica-Bold')
            .text(member.name, 85, y + 2)
            .font('Helvetica')
            .fillColor('#6B7280')
            .fontSize(10)
            .text(`${member.tasks} tarefas • ${member.completion}%`, 85, y + 12);

          // Barra de progresso
          const barWidth = 400;
          const barHeight = 8;
          const progressWidth = (member.completion / 100) * barWidth;

          doc
            .rect(85, y + 25, barWidth, barHeight)
            .fill('#E5E7EB')
            .rect(85, y + 25, progressWidth, barHeight)
            .fill('#3B82F6');

          doc.moveDown(1.2);
        });
      }

      // Tarefas por Mês
      if (stats.monthlyData.length > 0) {
        doc.addPage();
        doc
          .fontSize(18)
          .fillColor('#1F2937')
          .text('Tarefas Criadas por Mês', { underline: true })
          .moveDown(0.5);

        doc.fontSize(11).fillColor('#374151');

        const maxTasks = Math.max(...stats.monthlyData.map(d => d.tasks), 1);
        const chartWidth = 400;
        const chartHeight = 200;
        const chartX = 50;
        const chartY = doc.y;
        const barWidth = chartWidth / stats.monthlyData.length - 10;

        // Eixos
        doc
          .moveTo(chartX, chartY)
          .lineTo(chartX, chartY + chartHeight)
          .lineTo(chartX + chartWidth, chartY + chartHeight)
          .stroke('#E5E7EB');

        // Barras
        stats.monthlyData.forEach((data, index) => {
          const barHeight = (data.tasks / maxTasks) * chartHeight;
          const x = chartX + index * (barWidth + 10) + 5;
          const y = chartY + chartHeight - barHeight;

          doc
            .rect(x, y, barWidth, barHeight)
            .fill('#3B82F6');

          // Valor
          doc
            .fillColor('#1F2937')
            .fontSize(9)
            .text(data.tasks.toString(), x, y - 15, { width: barWidth, align: 'center' });

          // Mês
          doc
            .fillColor('#6B7280')
            .fontSize(8)
            .text(data.month, x, chartY + chartHeight + 5, { width: barWidth, align: 'center' });
        });
      }

      // Adicionar rodapé em todas as páginas após o conteúdo ser criado
      const range = doc.bufferedPageRange();
      const totalPages = range.count;
      
      for (let i = range.start; i < range.start + range.count; i++) {
        doc.switchToPage(i);
        doc
          .fontSize(8)
          .fillColor('#9CA3AF')
          .text(
            `Página ${i - range.start + 1} de ${totalPages}`,
            doc.page.width - 100,
            doc.page.height - 30,
            { align: 'right' }
          );
      }

      // Finalizar PDF
      doc.end();
    } catch (error) {
      next(error);
    }
  }
}

