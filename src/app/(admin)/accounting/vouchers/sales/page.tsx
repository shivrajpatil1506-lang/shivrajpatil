"use client";

import React, { useState } from "react";
import { Plus, Trash2, Save } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SalesInvoicePage() {
  const router = useRouter();
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [partyId, setPartyId] = useState("");
  const [narration, setNarration] = useState("");
  const [items, setItems] = useState([
    { stockItemId: "", qty: 1, rate: 0, amount: 0 },
  ]);

  const mockParties = [
    { id: "L1", name: "Acme Corp (Customer)" },
    { id: "L2", name: "John Doe (Customer)" },
  ];

  const mockStockItems = [
    { id: "S1", name: "Cement Bag 50kg", rate: 450, gst: 28 },
    { id: "S2", name: "TMT Steel Bar (Ton)", rate: 55000, gst: 18 },
  ];

  const addLine = () => {
    setItems([...items, { stockItemId: "", qty: 1, rate: 0, amount: 0 }]);
  };

  const removeLine = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateLine = (index: number, field: string, value: any) => {
    const newItems = [...items];
    const item = newItems[index];
    (item as any)[field] = value;
    
    if (field === 'stockItemId') {
      const matched = mockStockItems.find(s => s.id === value);
      if (matched) {
        item.rate = matched.rate;
      }
    }
    
    // Auto calculate amount
    item.amount = item.qty * item.rate;
    setItems(newItems);
  };

  const subTotal = items.reduce((sum, item) => sum + item.amount, 0);
  const cgst = subTotal * 0.09; // Mock 9%
  const sgst = subTotal * 0.09; // Mock 9%
  const grandTotal = subTotal + cgst + sgst;

  const handleSave = async () => {
    if (!partyId) return alert("Please select a party.");
    if (items.some(i => !i.stockItemId || i.amount <= 0)) return alert("Please fill all items correctly.");

    alert("Sales Invoice Validated!\nSubtotal: " + subTotal + "\nGrand Total: " + grandTotal);
    // Call server action here
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6 border-b border-neutral-200 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-neutral-800">Sales Invoice (F8)</h2>
          <p className="text-sm text-neutral-500">Record an itemized sales transaction.</p>
        </div>
        <div className="flex gap-2">
          <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors" onClick={handleSave}>
            <Save className="w-4 h-4" />
            Save Invoice
          </button>
        </div>
      </div>

      <div className="bg-white border border-neutral-200 rounded-xl shadow-sm overflow-hidden">
        {/* Header Details */}
        <div className="bg-neutral-50 p-4 border-b border-neutral-200 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-xs font-semibold text-neutral-500 uppercase mb-1">Party / Customer</label>
            <select 
              value={partyId}
              onChange={(e) => setPartyId(e.target.value)}
              className="w-full border-neutral-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="">-- Select Party --</option>
              {mockParties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-neutral-500 uppercase mb-1">Invoice No.</label>
            <input type="text" disabled value="Auto" className="w-full bg-neutral-100 border-neutral-300 rounded-md sm:text-sm text-neutral-500" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-neutral-500 uppercase mb-1">Date</label>
            <input 
              type="date" 
              value={invoiceDate}
              onChange={(e) => setInvoiceDate(e.target.value)}
              className="w-full border-neutral-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" 
            />
          </div>
        </div>

        {/* Item Grid */}
        <div className="p-4 overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-neutral-500 border-b-2 border-neutral-300 font-bold uppercase text-xs">
              <tr>
                <th className="px-2 py-2">Name of Item</th>
                <th className="px-2 py-2 text-right w-32">Quantity</th>
                <th className="px-2 py-2 text-right w-32">Rate</th>
                <th className="px-2 py-2 text-right w-40">Amount</th>
                <th className="px-2 py-2 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={idx} className="border-b border-neutral-100 group">
                  <td className="px-2 py-2">
                    <select 
                      value={item.stockItemId}
                      onChange={(e) => updateLine(idx, 'stockItemId', e.target.value)}
                      className="w-full border-transparent bg-transparent rounded focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="">-- Select Item --</option>
                      {mockStockItems.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </td>
                  <td className="px-2 py-2">
                    <input 
                      type="number" 
                      value={item.qty}
                      onChange={(e) => updateLine(idx, 'qty', parseFloat(e.target.value) || 0)}
                      className="w-full text-right border-neutral-300 rounded focus:border-blue-500 focus:ring-blue-500" 
                    />
                  </td>
                  <td className="px-2 py-2">
                    <input 
                      type="number" 
                      value={item.rate}
                      onChange={(e) => updateLine(idx, 'rate', parseFloat(e.target.value) || 0)}
                      className="w-full text-right border-neutral-300 rounded focus:border-blue-500 focus:ring-blue-500" 
                    />
                  </td>
                  <td className="px-2 py-2 text-right font-mono font-medium">
                    {item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-2 py-2 text-right">
                    <button onClick={() => removeLine(idx)} className="text-neutral-300 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={5} className="px-2 py-2 border-b border-neutral-200">
                  <button onClick={addLine} className="text-blue-600 hover:text-blue-700 text-xs font-semibold flex items-center gap-1">
                    <Plus className="w-3 h-3" /> Add Item
                  </button>
                </td>
              </tr>
              {/* Totals & Taxes */}
              <tr className="font-medium text-neutral-600">
                <td colSpan={3} className="px-2 py-1 text-right">Sub Total:</td>
                <td className="px-2 py-1 text-right font-mono">{subTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                <td></td>
              </tr>
              <tr className="font-medium text-neutral-500 text-xs">
                <td colSpan={3} className="px-2 py-1 text-right">CGST (9%):</td>
                <td className="px-2 py-1 text-right font-mono">{cgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                <td></td>
              </tr>
              <tr className="font-medium text-neutral-500 text-xs">
                <td colSpan={3} className="px-2 py-1 text-right">SGST (9%):</td>
                <td className="px-2 py-1 text-right font-mono">{sgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                <td></td>
              </tr>
              <tr className="font-bold text-neutral-900 bg-neutral-50 border-t-2 border-neutral-300 text-base">
                <td colSpan={3} className="px-4 py-3 text-right">Grand Total:</td>
                <td className="px-2 py-3 text-right font-mono text-blue-700">{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Narration */}
        <div className="p-4 bg-neutral-50 border-t border-neutral-200">
          <label className="block text-xs font-semibold text-neutral-500 uppercase mb-1">Narration</label>
          <textarea 
            rows={2}
            value={narration}
            onChange={(e) => setNarration(e.target.value)}
            className="w-full border-neutral-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>
      </div>
    </div>
  );
}
