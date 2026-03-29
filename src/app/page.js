"use client";

import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';

export default function ShopData() {
  const [data, setData] = useState([]);
  const [editModal, setEditModal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // 1. Data Fetch Function
  const fetchData = async () => {
    try {
      const response = await fetch('/api/sheets');
      const result = await response.json();
      setData(result || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 2. Delete Logic
  const handleDelete = async (rowIndex) => {
    if (!confirm("Are you sure you want to delete this row?")) return;
    setIsSaving(true);
    try {
      await fetch('/api/sheets', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rowIndex })
      });
      await fetchData();
    } catch (error) {
      alert("Delete failed!");
    } finally {
      setIsSaving(false);
    }
  };

  // 3. Save Logic (New & Update)
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const isNew = editModal.isNew;
      const response = await fetch('/api/sheets', {
        method: isNew ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          isNew 
          ? { rowData: editModal.values } 
          : { rowIndex: editModal.index, rowData: editModal.values }
        )
      });

      if (response.ok) {
        setEditModal(null);
        await fetchData();
      } else {
        throw new Error("Failed to save");
      }
    } catch (error) {
      alert("Save failed!");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500 flex flex-col justify-center items-center min-h-screen gap-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="font-medium">Loading Sheet Data...</p>
      </div>
    );
  }

  const [headers, ...rows] = data;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <Navbar 
        isSaving={isSaving} 
        onNewEntry={() => setEditModal({ isNew: true, values: Array(headers?.length || 11).fill('') })} 
      />  

      <main className="p-8">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Shop Order Summary</h1>
            <p className="text-sm text-gray-500 mt-1">Manage your google sheet entries</p>
          </div>
          <div className="text-sm font-medium bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
            Total: <span className="text-blue-600">{rows.length}</span> Records
          </div>
        </div>
        
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/80">
                <th className="p-4 font-bold uppercase text-[10px] tracking-widest text-gray-500 border-b border-gray-200">Actions</th>
                {headers?.map((header, i) => (
                  <th key={i} className="p-4 font-bold uppercase text-[10px] tracking-widest text-gray-500 border-b border-gray-200">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((row, rowIndex) => (
                <tr key={rowIndex} className="hover:bg-blue-50/40 transition-colors group">
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setEditModal({ index: rowIndex, values: [...row] })}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition"
                        title="Edit Row"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                      </button>
                      <button 
                        onClick={() => handleDelete(rowIndex)}
                        disabled={isSaving}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition disabled:opacity-50"
                        title="Delete Row"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                      </button>
                    </div>
                  </td>
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex} className="p-4 text-sm text-gray-600 whitespace-nowrap">{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* --- MODAL SECTION --- */}
      {editModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">
                {editModal.isNew ? "Add New Order" : "Edit Order Details"}
              </h2>
              <button onClick={() => setEditModal(null)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            </div>
            
            {/* Modal Body */}
            <div className="p-6 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {(headers || Array(11).fill("Field")).map((h, i) => {
                  // Smart input type check
                  const isDateField = h.toLowerCase().includes("date");
                  const isNumberField = h.toLowerCase().includes("quantity") || h.toLowerCase().includes("rate");

                  return (
                    <div key={i} className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-extrabold text-gray-400 uppercase tracking-wider">{h}</label>
                      <input 
                        type={isDateField ? "date" : isNumberField ? "number" : "text"}
                        className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition bg-gray-50/50"
                        value={editModal.values[i] || ''}
                        onChange={(e) => {
                          const newValues = [...editModal.values];
                          newValues[i] = e.target.value;
                          setEditModal({ ...editModal, values: newValues });
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t flex justify-end gap-3 bg-gray-50/50 rounded-b-2xl">
              <button 
                disabled={isSaving}
                onClick={() => setEditModal(null)}
                className="px-6 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-200 rounded-xl transition"
              >
                Cancel
              </button>
              <button 
                disabled={isSaving}
                onClick={handleSave}
                className="px-6 py-2.5 text-sm font-bold bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition disabled:opacity-50 flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}