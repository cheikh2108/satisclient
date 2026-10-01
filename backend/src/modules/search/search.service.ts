import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  async search(organizationId: string, query: string) {
    const q = query.trim();
    if (q.length < 2) return [];
    const contains = { contains: q, mode: 'insensitive' as const };

    const [users, sites, feedbacks, complaints, surveys] = await Promise.all([
      this.prisma.user.findMany({
        where: {
          organizationId,
          deletedAt: null,
          OR: [{ firstName: contains }, { lastName: contains }, { email: contains }],
        },
        select: { id: true, firstName: true, lastName: true, email: true },
        take: 5,
      }),
      this.prisma.site.findMany({
        where: { organizationId, OR: [{ name: contains }, { code: contains }] },
        select: { id: true, name: true, code: true },
        take: 5,
      }),
      this.prisma.feedback.findMany({
        where: {
          organizationId,
          OR: [{ comment: contains }, { respondentName: contains }, { respondentEmail: contains }],
        },
        select: { id: true, comment: true, respondentName: true, site: { select: { name: true } } },
        take: 5,
      }),
      this.prisma.complaint.findMany({
        where: {
          organizationId,
          OR: [{ title: contains }, { ticketNumber: contains }, { description: contains }],
        },
        select: { id: true, title: true, ticketNumber: true },
        take: 5,
      }),
      this.prisma.survey.findMany({
        where: { organizationId, OR: [{ title: contains }, { description: contains }] },
        select: { id: true, title: true },
        take: 5,
      }),
    ]);

    return [
      ...users.map((user) => ({
        type: 'user',
        id: user.id,
        title: `${user.firstName} ${user.lastName}`,
        subtitle: user.email,
        href: '/dashboard/users',
      })),
      ...sites.map((site) => ({
        type: 'site',
        id: site.id,
        title: site.name,
        subtitle: site.code || 'Établissement',
        href: '/dashboard/sites',
      })),
      ...feedbacks.map((feedback) => ({
        type: 'feedback',
        id: feedback.id,
        title: feedback.respondentName || 'Feedback anonyme',
        subtitle: feedback.site?.name || feedback.comment?.slice(0, 60) || 'Feedback',
        href: '/dashboard/feedbacks',
      })),
      ...complaints.map((complaint) => ({
        type: 'complaint',
        id: complaint.id,
        title: complaint.title,
        subtitle: complaint.ticketNumber,
        href: '/dashboard/reclamations',
      })),
      ...surveys.map((survey) => ({
        type: 'survey',
        id: survey.id,
        title: survey.title,
        subtitle: 'Enquête',
        href: '/dashboard/surveys',
      })),
    ].slice(0, 20);
  }
}
