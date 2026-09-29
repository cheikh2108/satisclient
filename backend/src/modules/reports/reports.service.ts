import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as PDFDocument from 'pdfkit';
import * as ExcelJS from 'exceljs';

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ─── Utilitaires ──────────────────────────────────────────────────────────────

  private formatDate(d: Date | string | null): string {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  private priorityLabel(p: string): string {
    return { low: 'Basse', normal: 'Normale', high: 'Haute', urgent: 'Urgente' }[p] || p;
  }

  private statusLabel(s: string): string {
    return {
      received: 'Reçue', qualified: 'Qualifiée', assigned: 'Assignée',
      in_progress: 'En cours', resolved: 'Résolue', closed: 'Fermée',
      rejected: 'Rejetée', on_hold: 'En pause',
    }[s] || s;
  }

  private sentimentLabel(s: string): string {
    return { positive: 'Positif', negative: 'Négatif', neutral: 'Neutre', unknown: '—' }[s] || s;
  }

  // ─── PDF helpers ──────────────────────────────────────────────────────────────

  private buildPDFHeader(doc: PDFKit.PDFDocument, title: string, subtitle: string) {
    // En-tête coloré
    doc.rect(0, 0, doc.page.width, 80).fill('#3a5a40');
    doc.fillColor('white').fontSize(22).font('Helvetica-Bold').text('SatisClient', 40, 20);
    doc.fontSize(12).font('Helvetica').text(title, 40, 48);
    doc.fillColor('#ccddcc').fontSize(9).text(subtitle, 40, 65);

    doc.fillColor('#0a0a0a');
    doc.y = 100;
  }

  private buildPDFTable(
    doc: PDFKit.PDFDocument,
    headers: string[],
    rows: string[][],
    colWidths: number[],
  ) {
    const startX = 40;
    const rowH = 22;
    let y = doc.y + 10;

    // Header row
    doc.fillColor('#3a5a40').rect(startX, y, colWidths.reduce((a, b) => a + b, 0), rowH).fill();
    doc.fillColor('white').fontSize(9).font('Helvetica-Bold');
    let x = startX + 5;
    headers.forEach((h, i) => { doc.text(h, x, y + 7, { width: colWidths[i] - 8, lineBreak: false }); x += colWidths[i]; });

    // Data rows
    rows.forEach((row, ri) => {
      y += rowH;
      if (y > doc.page.height - 60) { doc.addPage(); y = 40; }
      const bg = ri % 2 === 0 ? '#f5f0e8' : 'white';
      doc.fillColor(bg).rect(startX, y, colWidths.reduce((a, b) => a + b, 0), rowH).fill();
      doc.fillColor('#333').fontSize(8).font('Helvetica');
      x = startX + 5;
      row.forEach((cell, i) => {
        doc.text(String(cell || '—'), x, y + 7, { width: colWidths[i] - 8, lineBreak: false });
        x += colWidths[i];
      });
    });

    doc.y = y + rowH + 10;
  }

  private buildPDFStats(doc: PDFKit.PDFDocument, stats: { label: string; value: string | number }[]) {
    const perRow = 3;
    const boxW = (doc.page.width - 80) / perRow;
    const boxH = 50;
    let x = 40;
    let y = doc.y + 10;

    stats.forEach((s, i) => {
      if (i > 0 && i % perRow === 0) { y += boxH + 8; x = 40; }
      doc.fillColor('#f5f0e8').rect(x, y, boxW - 8, boxH).fill();
      doc.fillColor('#3a5a40').fontSize(18).font('Helvetica-Bold').text(String(s.value), x + 8, y + 8, { width: boxW - 24 });
      doc.fillColor('#666').fontSize(8).font('Helvetica').text(s.label, x + 8, y + 32, { width: boxW - 24 });
      x += boxW;
    });
    doc.y = y + boxH + 15;
  }

  private finalizePDF(doc: PDFKit.PDFDocument) {
    const pages = (doc as any)._root?.data?.Count ?? 1;
    doc.fillColor('#999').fontSize(8)
      .text(`Généré le ${new Date().toLocaleDateString('fr-FR')} — SatisClient`, 40, doc.page.height - 30, { align: 'center' });
  }

  // ─── Rapport Réclamations ─────────────────────────────────────────────────────

  async generateComplaintsReport(params: {
    organizationId: string;
    startDate?: Date;
    endDate?: Date;
    format: 'pdf' | 'excel' | 'csv';
  }): Promise<Buffer> {
    const where: any = { organizationId: params.organizationId };
    if (params.startDate || params.endDate) {
      where.createdAt = {};
      if (params.startDate) where.createdAt.gte = params.startDate;
      if (params.endDate) where.createdAt.lte = params.endDate;
    }

    const [complaints, stats] = await Promise.all([
      this.prisma.complaint.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: { site: { select: { name: true } } },
        take: 1000,
      }),
      this.prisma.complaint.groupBy({ by: ['status'], where, _count: true }),
    ]);

    const statsMap = stats.reduce((a, s) => ({ ...a, [s.status]: s._count }), {} as any);

    if (params.format === 'csv') return this.complaintsToCSV(complaints);
    if (params.format === 'excel') return this.complaintsToExcel(complaints, statsMap);
    return this.complaintsToPDF(complaints, statsMap, params);
  }

  private async complaintsToPDF(complaints: any[], statsMap: any, params: any): Promise<Buffer> {
    return new Promise((resolve) => {
      const doc = new PDFDocument({ size: 'A4', margin: 40 });
      const chunks: Buffer[] = [];
      doc.on('data', c => chunks.push(c));
      doc.on('end', () => resolve(Buffer.concat(chunks)));

      const period = params.startDate && params.endDate
        ? `Du ${this.formatDate(params.startDate)} au ${this.formatDate(params.endDate)}`
        : `Toutes les réclamations`;

      this.buildPDFHeader(doc, 'Rapport Réclamations', period);

      this.buildPDFStats(doc, [
        { label: 'Total', value: complaints.length },
        { label: 'Reçues', value: (statsMap.received || 0) + (statsMap.qualified || 0) },
        { label: 'En cours', value: (statsMap.in_progress || 0) + (statsMap.assigned || 0) },
        { label: 'Résolues', value: (statsMap.resolved || 0) + (statsMap.closed || 0) },
        { label: 'Urgentes', value: complaints.filter(c => c.priority === 'urgent').length },
        { label: 'Délai moy. (j)', value: complaints.filter(c => c.resolvedAt).length > 0
          ? Math.round(complaints.filter(c => c.resolvedAt).reduce((a, c) => {
              const d = (new Date(c.resolvedAt).getTime() - new Date(c.createdAt).getTime()) / (1000 * 60 * 60 * 24);
              return a + d;
            }, 0) / complaints.filter(c => c.resolvedAt).length)
          : '—' },
      ]);

      this.buildPDFTable(doc,
        ['N° Ticket', 'Titre', 'Site', 'Priorité', 'Statut', 'Date'],
        complaints.map(c => [c.ticketNumber, c.title?.slice(0, 35), c.site?.name || '—', this.priorityLabel(c.priority), this.statusLabel(c.status), this.formatDate(c.createdAt)]),
        [90, 150, 90, 65, 65, 75],
      );

      this.finalizePDF(doc);
      doc.end();
    });
  }

  private async complaintsToExcel(complaints: any[], statsMap: any): Promise<Buffer> {
    const wb = new ExcelJS.Workbook();
    wb.creator = 'SatisClient';

    // Feuille résumé
    const ws1 = wb.addWorksheet('Résumé');
    ws1.columns = [{ width: 30 }, { width: 15 }];
    ws1.addRow(['Statistiques Réclamations']).font = { bold: true, size: 14, color: { argb: 'FF3a5a40' } };
    ws1.addRow([]);
    ws1.addRow(['Total', complaints.length]);
    ws1.addRow(['Résolues', (statsMap.resolved || 0) + (statsMap.closed || 0)]);
    ws1.addRow(['En cours', (statsMap.in_progress || 0) + (statsMap.assigned || 0)]);
    ws1.addRow(['Urgentes', complaints.filter(c => c.priority === 'urgent').length]);
    ws1.addRow(['Généré le', new Date().toLocaleDateString('fr-FR')]);

    // Feuille détail
    const ws2 = wb.addWorksheet('Réclamations');
    const headers = ['N° Ticket', 'Titre', 'Site', 'Catégorie', 'Priorité', 'Statut', 'Client', 'Date création', 'Date résolution'];
    const hRow = ws2.addRow(headers);
    hRow.eachCell(c => { c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF3a5a40' } }; c.font = { bold: true, color: { argb: 'FFFFFFFF' } }; });
    ws2.columns = headers.map((_, i) => ({ width: [15, 35, 20, 15, 12, 12, 25, 15, 15][i] }));

    complaints.forEach((c, i) => {
      const row = ws2.addRow([c.ticketNumber, c.title, c.site?.name, c.category || '—', this.priorityLabel(c.priority), this.statusLabel(c.status), c.complainantName || 'Anonyme', this.formatDate(c.createdAt), this.formatDate(c.resolvedAt)]);
      if (i % 2 === 0) row.eachCell(cell => { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF5F0E8' } }; });
    });

    return wb.xlsx.writeBuffer().then(b => Buffer.from(b));
  }

  private complaintsToCSV(complaints: any[]): Buffer {
    const headers = ['N° Ticket', 'Titre', 'Site', 'Catégorie', 'Priorité', 'Statut', 'Client', 'Email', 'Date création', 'Date résolution'];
    const rows = complaints.map(c => [c.ticketNumber, c.title, c.site?.name || '', c.category || '', this.priorityLabel(c.priority), this.statusLabel(c.status), c.complainantName || '', c.complainantEmail || '', this.formatDate(c.createdAt), this.formatDate(c.resolvedAt)]);
    const csv = '﻿' + [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    return Buffer.from(csv, 'utf-8');
  }

  // ─── Rapport Analytics ────────────────────────────────────────────────────────

  async generateAnalyticsReport(params: {
    organizationId: string;
    startDate?: Date;
    endDate?: Date;
    format: 'pdf' | 'excel' | 'csv';
  }): Promise<Buffer> {
    const where: any = { organizationId: params.organizationId };
    if (params.startDate) where.createdAt = { gte: params.startDate };
    if (params.endDate) where.createdAt = { ...where.createdAt, lte: params.endDate };

    const [feedbacks, complaints, sites] = await Promise.all([
      this.prisma.feedback.findMany({ where, include: { site: { select: { name: true } } }, take: 5000 }),
      this.prisma.complaint.findMany({ where, include: { site: { select: { name: true } } }, take: 5000 }),
      this.prisma.site.findMany({ where: { organizationId: params.organizationId } }),
    ]);

    const avgRating = feedbacks.filter(f => f.overallRating).reduce((a, f) => a + (f.overallRating || 0), 0) / (feedbacks.filter(f => f.overallRating).length || 1);
    const positive = feedbacks.filter(f => f.commentSentiment === 'positive').length;

    if (params.format === 'csv') return this.analyticsToCSV(feedbacks, complaints);
    if (params.format === 'excel') return this.analyticsToExcel(feedbacks, complaints, sites, avgRating, positive);
    return this.analyticsToPDF(feedbacks, complaints, sites, avgRating, positive, params);
  }

  private async analyticsToPDF(feedbacks: any[], complaints: any[], sites: any[], avgRating: number, positive: number, params: any): Promise<Buffer> {
    return new Promise((resolve) => {
      const doc = new PDFDocument({ size: 'A4', margin: 40 });
      const chunks: Buffer[] = [];
      doc.on('data', c => chunks.push(c));
      doc.on('end', () => resolve(Buffer.concat(chunks)));

      this.buildPDFHeader(doc, 'Rapport Analytics', `Toutes périodes — ${sites.length} sites`);

      this.buildPDFStats(doc, [
        { label: 'Total Feedbacks', value: feedbacks.length },
        { label: 'Note moyenne', value: avgRating.toFixed(1) + '/5' },
        { label: 'Positifs', value: `${Math.round((positive / Math.max(feedbacks.length, 1)) * 100)}%` },
        { label: 'Réclamations', value: complaints.length },
        { label: 'Sites actifs', value: sites.length },
        { label: 'Taux résolution', value: `${Math.round((complaints.filter(c => c.status === 'resolved' || c.status === 'closed').length / Math.max(complaints.length, 1)) * 100)}%` },
      ]);

      // Répartition par sentiment
      const sentiments = ['positive', 'neutral', 'negative', 'unknown'];
      doc.fontSize(11).font('Helvetica-Bold').fillColor('#0a0a0a').text('Répartition par sentiment', 40, doc.y + 5);
      this.buildPDFTable(doc,
        ['Sentiment', 'Nombre', 'Pourcentage'],
        sentiments.map(s => [this.sentimentLabel(s), String(feedbacks.filter(f => f.commentSentiment === s).length), `${Math.round(feedbacks.filter(f => f.commentSentiment === s).length / Math.max(feedbacks.length, 1) * 100)}%`]),
        [180, 180, 180],
      );

      this.finalizePDF(doc);
      doc.end();
    });
  }

  private async analyticsToExcel(feedbacks: any[], complaints: any[], sites: any[], avgRating: number, positive: number): Promise<Buffer> {
    const wb = new ExcelJS.Workbook();

    const ws1 = wb.addWorksheet('Résumé');
    ws1.addRow(['Rapport Analytics SatisClient']).font = { bold: true, size: 14, color: { argb: 'FF3a5a40' } };
    ws1.addRow([]);
    ws1.addRow(['Total Feedbacks', feedbacks.length]);
    ws1.addRow(['Note moyenne', avgRating.toFixed(2)]);
    ws1.addRow(['% Positifs', `${Math.round(positive / Math.max(feedbacks.length, 1) * 100)}%`]);
    ws1.addRow(['Total Réclamations', complaints.length]);
    ws1.addRow(['Sites', sites.length]);
    ws1.columns = [{ width: 25 }, { width: 15 }];

    const ws2 = wb.addWorksheet('Feedbacks');
    const hRow = ws2.addRow(['Site', 'Note', 'Sentiment', 'Canal', 'Date']);
    hRow.eachCell(c => { c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF3a5a40' } }; c.font = { bold: true, color: { argb: 'FFFFFFFF' } }; });
    ws2.columns = [{ width: 25 }, { width: 8 }, { width: 12 }, { width: 12 }, { width: 15 }];
    feedbacks.forEach((f, i) => {
      const row = ws2.addRow([f.site?.name || '—', f.overallRating || '—', this.sentimentLabel(f.commentSentiment), f.feedbackChannel, this.formatDate(f.createdAt)]);
      if (i % 2 === 0) row.eachCell(c => { c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF5F0E8' } }; });
    });

    return wb.xlsx.writeBuffer().then(b => Buffer.from(b));
  }

  private analyticsToCSV(feedbacks: any[], complaints: any[]): Buffer {
    const fHeaders = ['Site', 'Note', 'Sentiment', 'Commentaire', 'Canal', 'Date'];
    const fRows = feedbacks.map(f => [f.site?.name || '', f.overallRating || '', this.sentimentLabel(f.commentSentiment), (f.comment || '').replace(/"/g, '""'), f.feedbackChannel, this.formatDate(f.createdAt)]);
    const csv = '﻿' + [fHeaders, ...fRows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    return Buffer.from(csv, 'utf-8');
  }

  // ─── Rapport Survey / Users (via analytics) ─────────────────────────────────

  async generateSurveyReport(params: { surveyId: string; format: 'pdf' | 'excel' | 'csv'; organizationId?: string }): Promise<Buffer> {
    return this.generateAnalyticsReport({ organizationId: params.organizationId || '', format: params.format });
  }

  // ─── Rapport Feedbacks ────────────────────────────────────────────────────────

  async generateFeedbacksReport(params: {
    organizationId: string;
    startDate?: Date;
    endDate?: Date;
    format: 'pdf' | 'excel' | 'csv';
  }): Promise<Buffer> {
    const where: any = { organizationId: params.organizationId };
    if (params.startDate || params.endDate) {
      where.createdAt = {};
      if (params.startDate) where.createdAt.gte = params.startDate;
      if (params.endDate) where.createdAt.lte = params.endDate;
    }

    const feedbacks = await this.prisma.feedback.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { site: { select: { name: true } } },
      take: 2000,
    });

    const total = feedbacks.length;
    const avgRating = feedbacks.filter(f => f.overallRating).reduce((a, f) => a + (f.overallRating || 0), 0) / (feedbacks.filter(f => f.overallRating).length || 1);
    const positive = feedbacks.filter(f => f.commentSentiment === 'positive').length;

    if (params.format === 'csv') return this.feedbacksToCSV(feedbacks);
    if (params.format === 'excel') return this.feedbacksToExcel(feedbacks, total, avgRating, positive);
    return this.feedbacksToPDF(feedbacks, total, avgRating, positive, params);
  }

  private async feedbacksToPDF(feedbacks: any[], total: number, avgRating: number, positive: number, params: any): Promise<Buffer> {
    return new Promise((resolve) => {
      const doc = new PDFDocument({ size: 'A4', margin: 40 });
      const chunks: Buffer[] = [];
      doc.on('data', c => chunks.push(c));
      doc.on('end', () => resolve(Buffer.concat(chunks)));

      const period = params.startDate && params.endDate
        ? `Du ${this.formatDate(params.startDate)} au ${this.formatDate(params.endDate)}`
        : `Tous les feedbacks`;

      this.buildPDFHeader(doc, 'Rapport Feedbacks', period);

      this.buildPDFStats(doc, [
        { label: 'Total feedbacks', value: total },
        { label: 'Note moyenne', value: avgRating.toFixed(1) + '/5' },
        { label: '% Positifs', value: `${Math.round((positive / Math.max(total, 1)) * 100)}%` },
        { label: 'Négatifs', value: feedbacks.filter(f => f.commentSentiment === 'negative').length },
        { label: 'Neutres', value: feedbacks.filter(f => f.commentSentiment === 'neutral').length },
        { label: 'Sans sentiment', value: feedbacks.filter(f => f.commentSentiment === 'unknown' || !f.commentSentiment).length },
      ]);

      this.buildPDFTable(doc,
        ['Site', 'Note', 'Sentiment', 'Commentaire', 'Canal', 'Date'],
        feedbacks.map(f => [
          f.site?.name || '—',
          f.overallRating ? String(f.overallRating) + '/5' : '—',
          this.sentimentLabel(f.commentSentiment),
          (f.comment || '').slice(0, 40),
          f.feedbackChannel || '—',
          this.formatDate(f.createdAt),
        ]),
        [100, 50, 65, 155, 65, 75],
      );

      this.finalizePDF(doc);
      doc.end();
    });
  }

  private async feedbacksToExcel(feedbacks: any[], total: number, avgRating: number, positive: number): Promise<Buffer> {
    const wb = new ExcelJS.Workbook();
    wb.creator = 'SatisClient';

    const ws1 = wb.addWorksheet('Résumé');
    ws1.columns = [{ width: 30 }, { width: 15 }];
    ws1.addRow(['Statistiques Feedbacks']).font = { bold: true, size: 14, color: { argb: 'FF3a5a40' } };
    ws1.addRow([]);
    ws1.addRow(['Total', total]);
    ws1.addRow(['Note moyenne', avgRating.toFixed(2)]);
    ws1.addRow(['% Positifs', `${Math.round((positive / Math.max(total, 1)) * 100)}%`]);
    ws1.addRow(['Négatifs', feedbacks.filter(f => f.commentSentiment === 'negative').length]);
    ws1.addRow(['Généré le', new Date().toLocaleDateString('fr-FR')]);

    const ws2 = wb.addWorksheet('Feedbacks');
    const headers = ['Site', 'Note', 'Sentiment', 'Commentaire', 'Canal', 'Date'];
    const hRow = ws2.addRow(headers);
    hRow.eachCell(c => { c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF3a5a40' } }; c.font = { bold: true, color: { argb: 'FFFFFFFF' } }; });
    ws2.columns = [{ width: 25 }, { width: 8 }, { width: 12 }, { width: 50 }, { width: 15 }, { width: 15 }];

    feedbacks.forEach((f, i) => {
      const row = ws2.addRow([f.site?.name || '—', f.overallRating || '—', this.sentimentLabel(f.commentSentiment), f.comment || '', f.feedbackChannel || '—', this.formatDate(f.createdAt)]);
      if (i % 2 === 0) row.eachCell(cell => { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF5F0E8' } }; });
    });

    return wb.xlsx.writeBuffer().then(b => Buffer.from(b));
  }

  private feedbacksToCSV(feedbacks: any[]): Buffer {
    const headers = ['Site', 'Note', 'Sentiment', 'Commentaire', 'Canal', 'Date'];
    const rows = feedbacks.map(f => [
      f.site?.name || '',
      f.overallRating || '',
      this.sentimentLabel(f.commentSentiment),
      (f.comment || '').replace(/"/g, '""'),
      f.feedbackChannel || '',
      this.formatDate(f.createdAt),
    ]);
    const csv = '﻿' + [headers, ...rows].map(r => r.map(v => `"${String(v)}"`).join(',')).join('\n');
    return Buffer.from(csv, 'utf-8');
  }

  // ─── Rapport Utilisateurs ─────────────────────────────────────────────────────

  async generateUsersReport(params: {
    organizationId: string;
    format: 'pdf' | 'excel' | 'csv';
  }): Promise<Buffer> {
    const users = await this.prisma.user.findMany({
      where: { organizationId: params.organizationId },
      orderBy: { createdAt: 'desc' },
      take: 2000,
    });

    if (params.format === 'csv') return this.usersToCSV(users);
    if (params.format === 'excel') return this.usersToExcel(users);
    return this.usersToPDF(users);
  }

  private roleLabel(r: string): string {
    return {
      super_admin: 'Super Admin', org_admin: 'Admin Org', quality_manager: 'Resp. Qualité',
      site_manager: 'Resp. Site', agent: 'Agent', viewer: 'Lecteur', director: 'Directeur',
    }[r] || r;
  }

  private async usersToPDF(users: any[]): Promise<Buffer> {
    return new Promise((resolve) => {
      const doc = new PDFDocument({ size: 'A4', margin: 40 });
      const chunks: Buffer[] = [];
      doc.on('data', c => chunks.push(c));
      doc.on('end', () => resolve(Buffer.concat(chunks)));

      this.buildPDFHeader(doc, 'Rapport Utilisateurs', `${users.length} utilisateurs`);

      this.buildPDFStats(doc, [
        { label: 'Total', value: users.length },
        { label: 'Actifs', value: users.filter(u => u.isActive).length },
        { label: 'Inactifs', value: users.filter(u => !u.isActive).length },
      ]);

      this.buildPDFTable(doc,
        ['Prénom', 'Nom', 'Email', 'Rôle', 'Statut', 'Inscription'],
        users.map(u => [
          u.firstName || '—',
          u.lastName || '—',
          u.email,
          this.roleLabel(u.role),
          u.isActive ? 'Actif' : 'Inactif',
          this.formatDate(u.createdAt),
        ]),
        [80, 80, 145, 90, 50, 75],
      );

      this.finalizePDF(doc);
      doc.end();
    });
  }

  private async usersToExcel(users: any[]): Promise<Buffer> {
    const wb = new ExcelJS.Workbook();
    wb.creator = 'SatisClient';

    const ws = wb.addWorksheet('Utilisateurs');
    const headers = ['Prénom', 'Nom', 'Email', 'Rôle', 'Statut', 'Dernière connexion', 'Date inscription'];
    const hRow = ws.addRow(headers);
    hRow.eachCell(c => { c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF3a5a40' } }; c.font = { bold: true, color: { argb: 'FFFFFFFF' } }; });
    ws.columns = [{ width: 18 }, { width: 18 }, { width: 32 }, { width: 18 }, { width: 10 }, { width: 20 }, { width: 18 }];

    users.forEach((u, i) => {
      const row = ws.addRow([u.firstName || '—', u.lastName || '—', u.email, this.roleLabel(u.role), u.isActive ? 'Actif' : 'Inactif', this.formatDate(u.lastLoginAt), this.formatDate(u.createdAt)]);
      if (i % 2 === 0) row.eachCell(cell => { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF5F0E8' } }; });
    });

    return wb.xlsx.writeBuffer().then(b => Buffer.from(b));
  }

  private usersToCSV(users: any[]): Buffer {
    const headers = ['Prénom', 'Nom', 'Email', 'Rôle', 'Statut', 'Dernière connexion', 'Date inscription'];
    const rows = users.map(u => [u.firstName || '', u.lastName || '', u.email, this.roleLabel(u.role), u.isActive ? 'Actif' : 'Inactif', this.formatDate(u.lastLoginAt), this.formatDate(u.createdAt)]);
    const csv = '﻿' + [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    return Buffer.from(csv, 'utf-8');
  }

  // ─── Rapport Sites ────────────────────────────────────────────────────────────

  async generateSitesReport(params: {
    organizationId: string;
    format: 'pdf' | 'excel' | 'csv';
  }): Promise<Buffer> {
    const sites = await this.prisma.site.findMany({
      where: { organizationId: params.organizationId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { feedbacks: true } },
      },
    });

    if (params.format === 'csv') return this.sitesToCSV(sites);
    if (params.format === 'excel') return this.sitesToExcel(sites);
    return this.sitesToPDF(sites);
  }

  private async sitesToPDF(sites: any[]): Promise<Buffer> {
    return new Promise((resolve) => {
      const doc = new PDFDocument({ size: 'A4', margin: 40 });
      const chunks: Buffer[] = [];
      doc.on('data', c => chunks.push(c));
      doc.on('end', () => resolve(Buffer.concat(chunks)));

      this.buildPDFHeader(doc, 'Rapport Sites', `${sites.length} sites`);

      this.buildPDFStats(doc, [
        { label: 'Total sites', value: sites.length },
        { label: 'Actifs', value: sites.filter(s => s.isActive).length },
        { label: 'Total feedbacks', value: sites.reduce((a, s) => a + (s._count?.feedbacks || 0), 0) },
      ]);

      this.buildPDFTable(doc,
        ['Nom', 'Code', 'Ville', 'Région', 'Actif', 'Feedbacks', 'Création'],
        sites.map(s => [
          s.name,
          s.code || '—',
          s.city || '—',
          s.region || '—',
          s.isActive ? 'Oui' : 'Non',
          String(s._count?.feedbacks || 0),
          this.formatDate(s.createdAt),
        ]),
        [110, 55, 75, 75, 40, 60, 75],
      );

      this.finalizePDF(doc);
      doc.end();
    });
  }

  private async sitesToExcel(sites: any[]): Promise<Buffer> {
    const wb = new ExcelJS.Workbook();
    wb.creator = 'SatisClient';

    const ws = wb.addWorksheet('Sites');
    const headers = ['Nom site', 'Code', 'Ville', 'Région', 'Actif', 'Nb feedbacks', 'Date création'];
    const hRow = ws.addRow(headers);
    hRow.eachCell(c => { c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF3a5a40' } }; c.font = { bold: true, color: { argb: 'FFFFFFFF' } }; });
    ws.columns = [{ width: 30 }, { width: 15 }, { width: 18 }, { width: 18 }, { width: 8 }, { width: 14 }, { width: 16 }];

    sites.forEach((s, i) => {
      const row = ws.addRow([s.name, s.code || '—', s.city || '—', s.region || '—', s.isActive ? 'Oui' : 'Non', s._count?.feedbacks || 0, this.formatDate(s.createdAt)]);
      if (i % 2 === 0) row.eachCell(cell => { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF5F0E8' } }; });
    });

    return wb.xlsx.writeBuffer().then(b => Buffer.from(b));
  }

  private sitesToCSV(sites: any[]): Buffer {
    const headers = ['Nom site', 'Code', 'Ville', 'Région', 'Actif', 'Nb feedbacks', 'Date création'];
    const rows = sites.map(s => [s.name, s.code || '', s.city || '', s.region || '', s.isActive ? 'Oui' : 'Non', s._count?.feedbacks || 0, this.formatDate(s.createdAt)]);
    const csv = '﻿' + [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    return Buffer.from(csv, 'utf-8');
  }
}
