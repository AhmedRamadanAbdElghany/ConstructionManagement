import { Injectable } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { CatalogItem } from '../../shared/interfaces';
import { map } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class CatalogService {
    private mockCatalogItems: CatalogItem[] = [
        { id: 1, name: 'Site Mobilization', unit: 'LS', defaultRate: 5000, category: 'Preliminaries' },
        { id: 2, name: 'Project Insurance', unit: 'LS', defaultRate: 2000, category: 'Preliminaries' },
        { id: 3, name: 'Security Guard', unit: 'Month', defaultRate: 1500, category: 'Labor' },
        { id: 4, name: 'Diesel Generator Rent', unit: 'Day', defaultRate: 200, category: 'Equipment' }
    ];

    private itemsSubject = new BehaviorSubject<CatalogItem[]>(this.mockCatalogItems);

    getCatalogItems(projectId?: number): Observable<CatalogItem[]> {
        return this.itemsSubject.asObservable().pipe(
            map(items => items.filter(i => projectId ? i.projectId === projectId : !i.projectId))
        );
    }

    addCatalogItem(item: Partial<CatalogItem>): Observable<CatalogItem> {
        const newItem: CatalogItem = {
            ...item as CatalogItem,
            id: Math.max(0, ...this.itemsSubject.value.map(i => i.id)) + 1
        };
        const current = this.itemsSubject.value;
        this.itemsSubject.next([...current, newItem]);
        return of(newItem);
    }

    updateCatalogItem(id: number, item: Partial<CatalogItem>): Observable<CatalogItem> {
        const current = this.itemsSubject.value;
        const index = current.findIndex(i => i.id === id);
        if (index > -1) {
            const updated = { ...current[index], ...item };
            current[index] = updated;
            this.itemsSubject.next([...current]);
            return of(updated);
        }
        throw new Error('Item not found');
    }

    deleteCatalogItem(id: number): Observable<void> {
        const current = this.itemsSubject.value;
        this.itemsSubject.next(current.filter(i => i.id !== id));
        return of(undefined);
    }
}
