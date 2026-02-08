import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

export interface InventoryTransaction {
    id: number;
    transactionDate: string;
    transactionType: 'In' | 'Out' | 'Transfer';
    itemId: number;
    itemName: string;
    quantity: number;
    referenceNumber?: string;
    performedBy?: string;
    notes?: string;
}

@Component({
    selector: 'app-inventory-transactions',
    standalone: true,
    imports: [CommonModule, FormsModule, TranslateModule],
    templateUrl: './inventory-transactions.component.html',
    styleUrls: ['./inventory-transactions.component.scss']
})
export class InventoryTransactionsComponent implements OnInit {
    transactions: InventoryTransaction[] = [];
    filteredTransactions: InventoryTransaction[] = [];
    isLoading = false;

    filters = {
        search: '',
        transactionType: '',
        startDate: '',
        endDate: ''
    };

    ngOnInit() {
        this.loadTransactions();
    }

    loadTransactions() {
        this.isLoading = true;
        // TODO: Load transactions from backend
        this.transactions = [];
        this.filteredTransactions = [...this.transactions];
        this.isLoading = false;
    }

    filterTransactions() {
        this.filteredTransactions = this.transactions.filter(t => {
            const matchesSearch = !this.filters.search ||
                t.itemName.toLowerCase().includes(this.filters.search.toLowerCase()) ||
                (t.referenceNumber && t.referenceNumber.toLowerCase().includes(this.filters.search.toLowerCase()));

            const matchesType = !this.filters.transactionType || t.transactionType === this.filters.transactionType;

            const matchesStartDate = !this.filters.startDate || new Date(t.transactionDate) >= new Date(this.filters.startDate);
            const matchesEndDate = !this.filters.endDate || new Date(t.transactionDate) <= new Date(this.filters.endDate);

            return matchesSearch && matchesType && matchesStartDate && matchesEndDate;
        });
    }

    formatDate(date: string): string {
        return new Date(date).toLocaleDateString();
    }
}
