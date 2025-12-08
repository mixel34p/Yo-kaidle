'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import { MessageSquare, Trash2, Check, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

interface Feedback {
  id: string;
  username: string;
  email: string;
  feedback_type: 'bug' | 'suggestion' | 'other';
  title: string;
  description: string;
  browser_info: string;
  device_info: string;
  page_url: string;
  created_at: string;
  status: 'new' | 'acknowledged' | 'in_progress' | 'resolved' | 'wontfix';
}

export default function FeedbackAdmin() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  useEffect(() => {
    fetchFeedbacks();
  }, [selectedStatus]);

  const fetchFeedbacks = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('feedback')
        .select('*')
        .order('created_at', { ascending: false });

      if (selectedStatus !== 'all') {
        query = query.eq('status', selectedStatus);
      }

      const { data, error } = await query;
      if (error) throw error;
      setFeedbacks(data || []);
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
      toast.error('Error al cargar los reportes');
    } finally {
      setLoading(false);
    }
  };

  const deleteFeedback = async (id: string) => {
    try {
      const { error } = await supabase.from('feedback').delete().eq('id', id);
      if (error) throw error;
      setFeedbacks(feedbacks.filter((f) => f.id !== id));
      toast.success('Reporte eliminado');
    } catch (error) {
      console.error('Error deleting feedback:', error);
      toast.error('Error al eliminar el reporte');
    }
  };

  const typeEmoji = {
    bug: '🐛',
    suggestion: '💡',
    other: '📝',
  };

  const statusLabel = {
    new: 'Nuevo',
    acknowledged: 'Reconocido',
    in_progress: 'En progreso',
    resolved: 'Resuelto',
    wontfix: 'No se arreglará',
  };

  const statusColor = {
    new: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    acknowledged: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    resolved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    wontfix: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <MessageSquare size={32} className="text-blue-500" />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Panel de Feedback
        </h1>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'new', 'acknowledged', 'in_progress', 'resolved', 'wontfix'].map(
          (status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedStatus === status
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {status === 'all' ? 'Todos' : statusLabel[status as keyof typeof statusLabel]}
            </button>
          )
        )}
      </div>

      {/* Lista de reportes */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent" />
          <p className="text-gray-600 dark:text-gray-400 mt-2">Cargando reportes...</p>
        </div>
      ) : feedbacks.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <p>No hay reportes con este filtro</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {feedbacks.map((feedback, index) => (
            <motion.div
              key={feedback.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3 flex-1">
                  <span className="text-2xl">{typeEmoji[feedback.feedback_type]}</span>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                      {feedback.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {feedback.username || 'Anónimo'} • {new Date(feedback.created_at).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ml-2 ${
                    statusColor[feedback.status as keyof typeof statusColor]
                  }`}
                >
                  {statusLabel[feedback.status as keyof typeof statusLabel]}
                </span>
              </div>

              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {feedback.description}
              </p>

              <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
                <div>
                  <span className="font-semibold">Página:</span> {new URL(feedback.page_url).pathname}
                </div>
                <div>
                  <span className="font-semibold">Dispositivo:</span> {feedback.device_info}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => deleteFeedback(feedback.id)}
                  className="flex items-center gap-1 px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-900 dark:hover:bg-red-800 dark:text-red-200 rounded text-sm font-medium transition-colors"
                >
                  <Trash2 size={14} />
                  Eliminar
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
