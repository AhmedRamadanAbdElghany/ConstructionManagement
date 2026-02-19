export enum AnnouncementType {
    General = 'General',
    Offer = 'Offer'
}

export interface CompanyAnnouncement {
    id: number;
    companyId: number;
    title: string;
    content: string;
    type: AnnouncementType;
    imageUrl?: string;
    isPublished: boolean;
    publishedAt?: string;
    createdAt: string;
}

export interface CreateAnnouncementRequest {
    title: string;
    content: string;
    type: AnnouncementType;
    image?: File;
    isPublished: boolean;
}

export interface UpdateAnnouncementRequest {
    title?: string;
    content?: string;
    type?: AnnouncementType;
    image?: File;
    isPublished?: boolean;
}
