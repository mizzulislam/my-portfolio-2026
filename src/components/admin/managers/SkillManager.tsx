import { useState, useEffect, useRef } from "react";
import React from "react";
import { supabase } from "../../../lib/supabase";
import { motion, AnimatePresence } from "motion/react";
import { Project, Skill } from "../../../types";
import { translateToIndonesian } from "../../../lib/translate";
import { translateArrayToIndonesian } from "../../../lib/translate";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  ExternalLink,
  Award,
  ListFilter,
  ChevronDown,
  Eye,
  GripVertical,
  Zap,
  Tag,
  Calendar,
  Building2,
  User as UserIcon,
} from "lucide-react";
import {
  AdminCard,
  AdminInput,
  AdminBtn,
  AdminTextArea,
  AdminSelect,
  ImageUpload,
} from "../AdminSharedUI";

export default function SkillManager() {
  const [items, setItems] = useState<Skill[]>([]);
  const [form, setForm] = useState<Skill>({ name: "", category: "" });
  const [editId, setEditId] = useState<string | null>(null);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    const { data } = await supabase
      .from("skills")
      .select("*")
      .order("category");
    if (data) setItems(data);
  };

  const handleSave = async () => {
    if (editId) {
      await supabase.from("skills").update(form).eq("id", editId);
    } else {
      await supabase.from("skills").insert(form);
    }
    setForm({ name: "", category: "" });
    setEditId(null);
    fetchItems();
  };

  const handleEdit = (item: Skill) => {
    setForm(item);
    setEditId(item.id!);
  };
  const handleDelete = async (id: string) => {
    if (confirm("Delete this skill?")) {
      await supabase.from("skills").delete().eq("id", id);
      fetchItems();
    }
  };

  return (
    <div className="space-y-10">
      <AdminCard title="Technical Upgrade" icon={Zap}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
          <div className="col-span-full md:col-span-1">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 mb-2 block px-2">
              Skill Name
            </label>
            <AdminInput
              placeholder="React, Node.js, Cloud Integration..."
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div className="col-span-full md:col-span-1">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 mb-2 block px-2">
              Category (Group)
            </label>
            <AdminInput
              placeholder="Frontend, Backend, Infrastructure..."
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            />
          </div>
        </div>
        <AdminBtn onClick={handleSave}>
          {editId ? "Verify System Patch" : "Install Component"}
        </AdminBtn>
        {editId && (
          <div className="mt-2">
            <AdminBtn
              variant="secondary"
              onClick={() => {
                setEditId(null);
                setForm({ name: "", category: "" });
              }}
            >
              Cancel
            </AdminBtn>
          </div>
        )}
      </AdminCard>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="p-5 bg-slate-900/40 border border-white/5 rounded-2xl flex items-center justify-between group hover:border-blue-500/20 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                <Tag size={18} className="text-blue-500" />
              </div>
              <div className="overflow-hidden">
                <h3 className="text-sm font-black text-white uppercase tracking-tight truncate">
                  {item.name}
                </h3>
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest truncate">
                  {item.category}
                </p>
              </div>
            </div>
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => handleEdit(item)}
                className="text-slate-500 hover:text-white transition-colors"
              >
                <Edit2 size={16} />
              </button>
              <button
                onClick={() => handleDelete(item.id!)}
                className="text-red-900 hover:text-red-400 transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
