import {
  EXPENSE_CATS, PAID_BY, PARTNERS, PROJECT_CATS, COMPLETION_STATUS, LOCATIONS,
  MOVEMENT_REASONS, SUPPLIER_TYPES, STOCK_STATUS, PAYMENT_METHODS, TXN_TYPES,
} from "./constants";

export type FieldType = "text" | "number" | "currency" | "date" | "select" | "checkbox" | "textarea";
export type Field = { key: string; label: string; type: FieldType; options?: string[]; required?: boolean };
export type ColumnDef = { key: string; label: string; type?: FieldType };
export type ModuleDef = {
  key: string;
  table: string;
  title: string;
  idField?: string;
  idPrefix?: string;
  listColumns: ColumnDef[];
  fields: Field[];
};

export const MODULES: Record<string, ModuleDef> = {
  partnercontrib: {
    key: "partnercontrib", table: "partner_contributions", title: "Partner Contribution", idField: "txn_id", idPrefix: "PC",
    listColumns: [
      { key: "txn_date", label: "Date", type: "date" },
      { key: "partner", label: "Partner" },
      { key: "txn_type", label: "Type" },
      { key: "amount", label: "Amount", type: "currency" },
      { key: "reimbursed_amount", label: "Reimbursed", type: "currency" },
    ],
    fields: [
      { key: "txn_date", label: "Date", type: "date", required: true },
      { key: "partner", label: "Partner", type: "select", options: PARTNERS, required: true },
      { key: "txn_type", label: "Transaction type", type: "select", options: TXN_TYPES },
      { key: "description", label: "Description", type: "text" },
      { key: "related_stock_id", label: "Related Stock ID", type: "text" },
      { key: "amount", label: "Amount introduced (£)", type: "number" },
      { key: "payment_method", label: "Payment method", type: "select", options: PAYMENT_METHODS },
      { key: "business_purpose", label: "Business purpose", type: "text" },
      { key: "reimbursed_amount", label: "Reimbursed amount (£)", type: "number" },
      { key: "reimbursement_date", label: "Reimbursement date", type: "date" },
      { key: "notes", label: "Notes", type: "textarea" },
    ],
  },
  expenses: {
    key: "expenses", table: "expenses", title: "Expenses", idField: "expense_id", idPrefix: "EXP",
    listColumns: [
      { key: "expense_date", label: "Date", type: "date" },
      { key: "category", label: "Category" },
      { key: "description", label: "Description" },
      { key: "paid_by", label: "Paid by" },
      { key: "gross_amount", label: "Gross", type: "currency" },
    ],
    fields: [
      { key: "expense_date", label: "Date", type: "date", required: true },
      { key: "supplier", label: "Supplier", type: "text" },
      { key: "category", label: "Category", type: "select", options: EXPENSE_CATS },
      { key: "description", label: "Description", type: "text" },
      { key: "invoice_number", label: "Invoice / receipt no.", type: "text" },
      { key: "net_amount", label: "Net amount (£)", type: "number" },
      { key: "vat", label: "VAT (£)", type: "number" },
      { key: "paid_by", label: "Paid by", type: "select", options: PAID_BY },
      { key: "payment_method", label: "Payment method", type: "select", options: PAYMENT_METHODS },
      { key: "recurring", label: "Recurring?", type: "checkbox" },
      { key: "partner", label: "Partner (if partner-funded)", type: "select", options: PARTNERS },
      { key: "reimbursed", label: "Reimbursed?", type: "checkbox" },
      { key: "notes", label: "Notes", type: "textarea" },
    ],
  },
  building: {
    key: "building", table: "building_costs", title: "Building & Setup", idField: "project_id", idPrefix: "PROJ",
    listColumns: [
      { key: "cost_date", label: "Date", type: "date" },
      { key: "category", label: "Category" },
      { key: "contractor", label: "Contractor" },
      { key: "actual_cost", label: "Actual", type: "currency" },
      { key: "completion_status", label: "Status" },
    ],
    fields: [
      { key: "cost_date", label: "Date", type: "date" },
      { key: "category", label: "Category", type: "select", options: PROJECT_CATS },
      { key: "contractor", label: "Contractor / supplier", type: "text" },
      { key: "description", label: "Description", type: "text" },
      { key: "budget", label: "Original budget (£)", type: "number" },
      { key: "actual_cost", label: "Actual cost (£)", type: "number" },
      { key: "vat", label: "VAT (£)", type: "number" },
      { key: "paid_by", label: "Paid by", type: "select", options: PAID_BY },
      { key: "reimbursed_amount", label: "Amount reimbursed (£)", type: "number" },
      { key: "invoice_number", label: "Invoice number", type: "text" },
      { key: "completion_status", label: "Completion status", type: "select", options: COMPLETION_STATUS },
      { key: "notes", label: "Notes", type: "textarea" },
    ],
  },
  movements: {
    key: "movements", table: "stock_movements", title: "Stock Movement", idField: "movement_id", idPrefix: "MOV",
    listColumns: [
      { key: "moved_at", label: "When", type: "date" },
      { key: "stock_id", label: "Stock ID" },
      { key: "new_location", label: "To" },
      { key: "person_taking", label: "Person" },
      { key: "returned", label: "Returned", type: "checkbox" },
    ],
    fields: [
      { key: "stock_id", label: "Stock ID", type: "text" },
      { key: "item", label: "Item", type: "text" },
      { key: "previous_location", label: "From", type: "select", options: LOCATIONS },
      { key: "new_location", label: "To", type: "select", options: LOCATIONS },
      { key: "person_taking", label: "Person taking item", type: "text" },
      { key: "staff_authorising", label: "Staff authorising", type: "text" },
      { key: "reason", label: "Reason", type: "select", options: MOVEMENT_REASONS },
      { key: "expected_return", label: "Expected return date", type: "date" },
      { key: "actual_return", label: "Actual return date", type: "date" },
      { key: "returned", label: "Returned?", type: "checkbox" },
      { key: "notes", label: "Notes", type: "textarea" },
    ],
  },
  stocktake: {
    key: "stocktake", table: "stock_take", title: "Stock Take",
    listColumns: [
      { key: "take_date", label: "Date", type: "date" },
      { key: "stock_id", label: "Stock ID" },
      { key: "found", label: "Found", type: "checkbox" },
      { key: "actual_location", label: "Actual location" },
      { key: "difference", label: "Difference" },
    ],
    fields: [
      { key: "take_date", label: "Stock take date", type: "date" },
      { key: "stock_id", label: "Stock ID", type: "text" },
      { key: "item", label: "Item", type: "text" },
      { key: "expected_location", label: "Expected location", type: "text" },
      { key: "expected_status", label: "Expected status", type: "text" },
      { key: "found", label: "Physically found?", type: "checkbox" },
      { key: "actual_location", label: "Actual location", type: "select", options: LOCATIONS },
      { key: "checked_by", label: "Checked by", type: "text" },
      { key: "difference", label: "Difference / note", type: "text" },
      { key: "notes", label: "Notes", type: "textarea" },
    ],
  },
  suppliers: {
    key: "suppliers", table: "suppliers", title: "Suppliers", idField: "supplier_id", idPrefix: "SUP",
    listColumns: [
      { key: "name", label: "Name" },
      { key: "supplier_type", label: "Type" },
      { key: "telephone", label: "Phone" },
      { key: "outstanding_amount", label: "Outstanding", type: "currency" },
    ],
    fields: [
      { key: "name", label: "Supplier name", type: "text", required: true },
      { key: "supplier_type", label: "Type", type: "select", options: SUPPLIER_TYPES },
      { key: "contact_name", label: "Contact name", type: "text" },
      { key: "telephone", label: "Telephone", type: "text" },
      { key: "email", label: "Email", type: "text" },
      { key: "address", label: "Address", type: "textarea" },
      { key: "vat_number", label: "VAT number", type: "text" },
      { key: "payment_terms", label: "Payment terms", type: "text" },
      { key: "outstanding_amount", label: "Outstanding (£)", type: "number" },
      { key: "notes", label: "Notes", type: "textarea" },
    ],
  },
  customers: {
    key: "customers", table: "customers", title: "Customers", idField: "customer_id", idPrefix: "CUST",
    listColumns: [
      { key: "name", label: "Name" },
      { key: "telephone", label: "Phone" },
      { key: "email", label: "Email" },
      { key: "last_purchase", label: "Last purchase", type: "date" },
    ],
    fields: [
      { key: "name", label: "Name", type: "text" },
      { key: "telephone", label: "Telephone", type: "text" },
      { key: "email", label: "Email", type: "text" },
      { key: "first_purchase", label: "First purchase", type: "date" },
      { key: "last_purchase", label: "Last purchase", type: "date" },
      { key: "notes", label: "Notes", type: "textarea" },
    ],
  },
  staff: {
    key: "staff", table: "staff", title: "Staff", idField: "staff_id", idPrefix: "EMP",
    listColumns: [
      { key: "name", label: "Name" },
      { key: "position", label: "Position" },
      { key: "active", label: "Active", type: "checkbox" },
      { key: "sales_target", label: "Target", type: "currency" },
    ],
    fields: [
      { key: "name", label: "Staff name", type: "text", required: true },
      { key: "position", label: "Position", type: "text" },
      { key: "start_date", label: "Start date", type: "date" },
      { key: "active", label: "Active?", type: "checkbox" },
      { key: "sales_target", label: "Sales target (£)", type: "number" },
      { key: "notes", label: "Notes", type: "textarea" },
    ],
  },
  returns: {
    key: "returns", table: "returns", title: "Returns & Refunds", idField: "return_id", idPrefix: "RET",
    listColumns: [
      { key: "return_date", label: "Date", type: "date" },
      { key: "original_sale_id", label: "Sale ID" },
      { key: "stock_id", label: "Stock ID" },
      { key: "refund_amount", label: "Refund", type: "currency" },
    ],
    fields: [
      { key: "return_date", label: "Date", type: "date" },
      { key: "original_sale_id", label: "Original sale ID", type: "text" },
      { key: "stock_id", label: "Stock ID", type: "text" },
      { key: "customer_ref", label: "Customer reference", type: "text" },
      { key: "original_price", label: "Original selling price (£)", type: "number" },
      { key: "refund_amount", label: "Refund amount (£)", type: "number" },
      { key: "reason", label: "Reason", type: "text" },
      { key: "condition_on_return", label: "Condition on return", type: "text" },
      { key: "returned_to_stock", label: "Returned to stock?", type: "checkbox" },
      { key: "new_stock_status", label: "New stock status", type: "select", options: STOCK_STATUS },
      { key: "approved_by", label: "Approved by", type: "text" },
      { key: "notes", label: "Notes", type: "textarea" },
    ],
  },
};
