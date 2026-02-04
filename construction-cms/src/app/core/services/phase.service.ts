import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';

export interface Phase {
    id: number;
    name: string;
    description?: string;
    order: number;
    parentPhaseId?: number;
    isLeaf: boolean;
    startDate?: Date;
    endDate?: Date;
    children?: Phase[];
    items?: PhaseItem[];
}

export interface PhaseItem {
    id: number;
    name: string;
    unit?: string;
    defaultRate?: number;
    category?: string;
    startDate?: Date;
    endDate?: Date;
}

export interface CreatePhaseRequest {
    name: string;
    description?: string;
    parentPhaseId?: number;
    order?: number;
}

export interface UpdatePhaseRequest {
    name?: string;
    description?: string;
    order?: number;
}

@Injectable({
    providedIn: 'root'
})
export class PhaseService {
    private apiUrl = 'api/phases';

    // Mock storage using a flat list for better simulation of a database
    private flatDefaultPhases: Phase[] = [
        { id: 1, name: 'التجهيزات والموقع العام', order: 0, isLeaf: false, items: [] },
        { id: 101, name: 'مكاتب الموقع والسور', order: 0, parentPhaseId: 1, isLeaf: true, items: [] },
        { id: 102, name: 'توصيلات المياه والكهرباء', order: 1, parentPhaseId: 1, isLeaf: true, items: [] },
        { id: 2, name: 'أعمال الحفر والردم', order: 1, isLeaf: true, items: [] },
        { id: 3, name: 'أعمال الخرسانة', order: 2, isLeaf: false, items: [] },
        { id: 301, name: 'خرسانة عادية', order: 0, parentPhaseId: 3, isLeaf: true, items: [] },
        { id: 302, name: 'خرسانة مسلحة', order: 1, parentPhaseId: 3, isLeaf: true, items: [] }
    ];

    private dummyProjectPhases: { [key: number]: Phase[] } = {};

    constructor(private http: HttpClient) { }

    // Helper to build a tree from a flat list
    private buildTree(phases: Phase[], items: any[], parentId?: number): Phase[] {
        return phases
            .filter(item => item.parentPhaseId === parentId)
            .map(item => {
                const node: Phase = {
                    ...item,
                    children: this.buildTree(phases, items, item.id),
                    // Attach items that belong to this phase
                    items: items.filter(i => i.phaseId === item.id).map(i => ({
                        id: i.id,
                        name: i.description || i.name,
                        unit: i.unit,
                        startDate: i.startDate ? new Date(i.startDate) : undefined,
                        endDate: i.endDate ? new Date(i.endDate) : undefined
                    }))
                };
                return node;
            })
            .sort((a, b) => a.order - b.order);
    }

    private calculateDates(phase: Phase): void {
        let minStart: number | undefined;
        let maxEnd: number | undefined;

        // Process children first (bottom-up)
        if (phase.children && phase.children.length > 0) {
            phase.children.forEach(child => {
                this.calculateDates(child);
                if (child.startDate) {
                    const childStart = new Date(child.startDate).getTime();
                    if (minStart === undefined || childStart < minStart) minStart = childStart;
                }
                if (child.endDate) {
                    const childEnd = new Date(child.endDate).getTime();
                    if (maxEnd === undefined || childEnd > maxEnd) maxEnd = childEnd;
                }
            });
        }

        // Process items
        if (phase.items && phase.items.length > 0) {
            phase.items.forEach(item => {
                if (item.startDate) {
                    const itemStart = new Date(item.startDate).getTime();
                    if (minStart === undefined || itemStart < minStart) minStart = itemStart;
                }
                if (item.endDate) {
                    const itemEnd = new Date(item.endDate).getTime();
                    if (maxEnd === undefined || itemEnd > maxEnd) maxEnd = itemEnd;
                }
            });
        }

        phase.startDate = minStart ? new Date(minStart) : undefined;
        phase.endDate = maxEnd ? new Date(maxEnd) : undefined;
    }

    // Project Phases
    getProjectPhases(projectId: number, allBoqItems: any[] = []): Observable<Phase[]> {
        const phases = this.dummyProjectPhases[projectId] || [];
        const tree = this.buildTree(phases, allBoqItems);
        tree.forEach(root => this.calculateDates(root));
        return of(tree);
    }

    createProjectPhase(projectId: number, request: CreatePhaseRequest): Observable<{ id: number }> {
        const newPhase: Phase = {
            id: Math.floor(Math.random() * 1000) + 100,
            name: request.name,
            description: request.description,
            order: request.order ?? 0,
            parentPhaseId: request.parentPhaseId,
            isLeaf: true,
            items: []
        };
        if (!this.dummyProjectPhases[projectId]) this.dummyProjectPhases[projectId] = [];
        this.dummyProjectPhases[projectId].push(newPhase);
        return of({ id: newPhase.id });
    }

    updatePhase(phaseId: number, request: UpdatePhaseRequest): Observable<void> {
        for (const projectId in this.dummyProjectPhases) {
            const phases = this.dummyProjectPhases[projectId];
            const index = phases.findIndex(p => p.id === phaseId);
            if (index !== -1) {
                this.dummyProjectPhases[projectId][index] = { ...this.dummyProjectPhases[projectId][index], ...request };
                break;
            }
        }
        return of(void 0);
    }

    deletePhase(phaseId: number): Observable<void> {
        for (const projectId in this.dummyProjectPhases) {
            const phases = this.dummyProjectPhases[projectId];
            const index = phases.findIndex(p => p.id === phaseId);
            if (index !== -1) {
                // Find all descendants to delete
                const getDescendants = (id: number): number[] => {
                    const children = phases.filter(p => p.parentPhaseId === id);
                    let ids = children.map(c => c.id);
                    children.forEach(c => {
                        ids = [...ids, ...getDescendants(c.id)];
                    });
                    return ids;
                };
                const idsToDelete = [phaseId, ...getDescendants(phaseId)];
                this.dummyProjectPhases[projectId] = phases.filter(p => !idsToDelete.includes(p.id));
                break;
            }
        }
        return of(void 0);
    }

    initializeProjectPhasesFromDefaults(projectId: number, companyId: number): Observable<void> {
        // Clone the flat default phases to the project
        const cloned = this.flatDefaultPhases.map(p => ({
            ...p,
            id: p.id + (projectId * 10000), // Ensure unique IDs for this project
            parentPhaseId: p.parentPhaseId ? p.parentPhaseId + (projectId * 10000) : undefined,
            items: []
        }));
        this.dummyProjectPhases[projectId] = cloned;
        return of(void 0);
    }

    // Company Default Phases
    getDefaultPhases(companyId: number): Observable<Phase[]> {
        // Return the tree built from the flat storage (no items or date calculation for templates)
        const tree = this.buildTree(this.flatDefaultPhases, []);
        return of(tree);
    }

    createDefaultPhase(companyId: number, request: CreatePhaseRequest): Observable<{ id: number }> {
        const newPhase: Phase = {
            id: Math.floor(Math.random() * 1000) + 100,
            name: request.name,
            description: request.description,
            order: request.order ?? 0,
            parentPhaseId: request.parentPhaseId,
            isLeaf: true,
            items: []
        };
        this.flatDefaultPhases.push(newPhase);
        return of({ id: newPhase.id });
    }

    updateDefaultPhase(defaultPhaseId: number, request: UpdatePhaseRequest): Observable<void> {
        const index = this.flatDefaultPhases.findIndex(p => p.id === defaultPhaseId);
        if (index !== -1) {
            this.flatDefaultPhases[index] = { ...this.flatDefaultPhases[index], ...request };
        }
        return of(void 0);
    }

    deleteDefaultPhase(defaultPhaseId: number): Observable<void> {
        // Simple recursive delete in flat list: find all descendants
        const getDescendants = (id: number): number[] => {
            const children = this.flatDefaultPhases.filter(p => p.parentPhaseId === id);
            let ids = children.map(c => c.id);
            children.forEach(c => {
                ids = [...ids, ...getDescendants(c.id)];
            });
            return ids;
        };

        const idsToDelete = [defaultPhaseId, ...getDescendants(defaultPhaseId)];
        this.flatDefaultPhases = this.flatDefaultPhases.filter(p => !idsToDelete.includes(p.id));
        return of(void 0);
    }
}
