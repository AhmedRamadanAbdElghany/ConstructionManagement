import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TaskStatus, TaskPriority, ProjectItemTask } from './task-management.service';

export interface DailyTaskBoard {
    id: number;
    companyId?: number;
    projectId: number;
    boardDate: Date;
    totalTasks: number;
    pendingTasks: number;
    inProgressTasks: number;
    completedTasks: number;
    issuesCount: number;
    notes?: string;
    createdByUserId: number;
    createdAt: Date;
    updatedAt?: Date;
}

export interface DailyBoardEntry {
    id: number;
    dailyBoardId: number;
    taskId: number;
    task?: ProjectItemTask;
    originalStatus: TaskStatus;
    currentStatus: TaskStatus;
    scheduledStartTime?: Date;
    scheduledEndTime?: Date;
    actualStartTime?: Date;
    actualEndTime?: Date;
    progressAtStart: number;
    currentProgress: number;
    notes?: string;
    issues?: string;
    isCompleted: boolean;
    isDelayed: boolean;
    delayReason?: string;
    sortOrder: number;
}

export interface DailyBoardSummary {
    boardDate: Date;
    totalTasks: number;
    byStatus: { [key: number]: number };
    byPriority: { [key: number]: number };
    overdueCount: number;
    dueSoonCount: number;
    issuesCount: number;
    completedToday: number;
    startedToday: number;
}

export interface CreateDailyBoardRequest {
    projectId: number;
    boardDate: Date;
    notes?: string;
}

export interface AddTaskToBoardRequest {
    taskId: number;
    scheduledStartTime?: Date;
    scheduledEndTime?: Date;
    notes?: string;
}

export interface UpdateBoardEntryRequest {
    scheduledStartTime?: Date;
    scheduledEndTime?: Date;
    notes?: string;
    issues?: string;
}

@Injectable({
    providedIn: 'root'
})
export class DailyBoardService {
    private apiUrl = 'api/daily-board';

    constructor(private http: HttpClient) { }

    // Daily Board CRUD
    createDailyBoard(request: CreateDailyBoardRequest): Observable<DailyTaskBoard> {
        return this.http.post<DailyTaskBoard>(this.apiUrl, request);
    }

    getDailyBoard(id: number): Observable<DailyTaskBoard> {
        return this.http.get<DailyTaskBoard>(`${this.apiUrl}/${id}`);
    }

    getDailyBoardByDate(projectId: number, date: Date): Observable<DailyTaskBoard> {
        const dateStr = date.toISOString().split('T')[0];
        return this.http.get<DailyTaskBoard>(`${this.apiUrl}/project/${projectId}/date/${dateStr}`);
    }

    getDailyBoardsByProject(projectId: number): Observable<DailyTaskBoard[]> {
        return this.http.get<DailyTaskBoard[]>(`${this.apiUrl}/project/${projectId}`);
    }

    getTodayBoard(projectId: number): Observable<DailyTaskBoard> {
        return this.http.get<DailyTaskBoard>(`${this.apiUrl}/project/${projectId}/today`);
    }

    updateDailyBoard(id: number, notes?: string): Observable<DailyTaskBoard> {
        return this.http.put<DailyTaskBoard>(`${this.apiUrl}/${id}`, { notes });
    }

    deleteDailyBoard(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    // Board Entries
    addTaskToBoard(boardId: number, request: AddTaskToBoardRequest): Observable<DailyBoardEntry> {
        return this.http.post<DailyBoardEntry>(`${this.apiUrl}/${boardId}/entries`, request);
    }

    getBoardEntries(boardId: number): Observable<DailyBoardEntry[]> {
        return this.http.get<DailyBoardEntry[]>(`${this.apiUrl}/${boardId}/entries`);
    }

    updateBoardEntry(entryId: number, request: UpdateBoardEntryRequest): Observable<DailyBoardEntry> {
        return this.http.put<DailyBoardEntry>(`${this.apiUrl}/entries/${entryId}`, request);
    }

    removeBoardEntry(entryId: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/entries/${entryId}`);
    }

    // Task Progress Updates
    startTaskFromBoard(entryId: number): Observable<DailyBoardEntry> {
        return this.http.post<DailyBoardEntry>(`${this.apiUrl}/entries/${entryId}/start`, {});
    }

    completeTaskFromBoard(entryId: number, notes?: string): Observable<DailyBoardEntry> {
        return this.http.post<DailyBoardEntry>(`${this.apiUrl}/entries/${entryId}/complete`, { notes });
    }

    reportIssue(entryId: number, issue: string): Observable<DailyBoardEntry> {
        return this.http.post<DailyBoardEntry>(`${this.apiUrl}/entries/${entryId}/issue`, { issue });
    }

    // Reordering
    reorderEntries(boardId: number, entryIds: number[]): Observable<DailyBoardEntry[]> {
        return this.http.post<DailyBoardEntry[]>(`${this.apiUrl}/${boardId}/reorder`, { entryIds });
    }

    // Summary & Statistics
    getDailySummary(projectId: number, date?: Date): Observable<DailyBoardSummary> {
        const dateStr = date ? date.toISOString().split('T')[0] : 'today';
        return this.http.get<DailyBoardSummary>(`${this.apiUrl}/project/${projectId}/summary/${dateStr}`);
    }

    getWeeklySummary(projectId: number, startDate?: Date): Observable<DailyBoardSummary[]> {
        let params: Record<string, string> = {};
        if (startDate) {
            params['startDate'] = startDate.toISOString().split('T')[0];
        }
        return this.http.get<DailyBoardSummary[]>(`${this.apiUrl}/project/${projectId}/weekly-summary`, { params });
    }

    // Quick Actions
    generateDailyBoard(projectId: number, date?: Date): Observable<DailyTaskBoard> {
        const params = date ? { date: date.toISOString().split('T')[0] } : {};
        return this.http.post<DailyTaskBoard>(`${this.apiUrl}/project/${projectId}/generate`, params);
    }

    copyBoardFromPrevious(projectId: number, previousDate: Date, newDate: Date): Observable<DailyTaskBoard> {
        return this.http.post<DailyTaskBoard>(`${this.apiUrl}/project/${projectId}/copy`, {
            previousDate: previousDate.toISOString().split('T')[0],
            newDate: newDate.toISOString().split('T')[0]
        });
    }

    // Bulk Operations
    addMultipleTasks(boardId: number, taskIds: number[]): Observable<DailyBoardEntry[]> {
        return this.http.post<DailyBoardEntry[]>(`${this.apiUrl}/${boardId}/entries/bulk`, { taskIds });
    }

    // Helper Methods
    formatDateForBoard(date: Date): string {
        return date.toISOString().split('T')[0];
    }

    getProgressColor(progress: number): string {
        if (progress >= 100) return 'bg-green-500';
        if (progress >= 75) return 'bg-blue-500';
        if (progress >= 50) return 'bg-yellow-500';
        if (progress >= 25) return 'bg-orange-500';
        return 'bg-red-500';
    }

    getStatusBadgeClass(status: TaskStatus): string {
        const classes = {
            [TaskStatus.Pending]: 'bg-gray-100 text-gray-800 border-gray-200',
            [TaskStatus.InProgress]: 'bg-blue-100 text-blue-800 border-blue-200',
            [TaskStatus.ReadyForReview]: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            [TaskStatus.RevisionRequested]: 'bg-orange-100 text-orange-800 border-orange-200',
            [TaskStatus.Approved]: 'bg-green-100 text-green-800 border-green-200',
            [TaskStatus.Rejected]: 'bg-red-100 text-red-800 border-red-200',
            [TaskStatus.OnHold]: 'bg-purple-100 text-purple-800 border-purple-200',
            [TaskStatus.Cancelled]: 'bg-gray-100 text-gray-600 border-gray-200'
        };
        return classes[status] || 'bg-gray-100 text-gray-800 border-gray-200';
    }
}
