import { useState, useEffect, useCallback } from 'react';
import apiService from '../services/api';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState(null);

  // Carregar notificações
  const loadNotifications = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      const response = await apiService.getNotifications(params);
      
      if (response.success) {
        setNotifications(response.data);
        return response;
      }
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Carregar contador de não lidas
  const loadUnreadCount = useCallback(async () => {
    try {
      const response = await apiService.getUnreadCount();
      if (response.success) {
        setUnreadCount(response.data.count);
      }
    } catch (error) {
      console.error('Erro ao carregar contador:', error);
    }
  }, []);

  // Marcar como lida
  const markAsRead = useCallback(async (notificationId) => {
    try {
      const response = await apiService.markAsRead(notificationId);
      
      if (response.success) {
        setNotifications(prev => 
          prev.map(notification => 
            notification.id === notificationId 
              ? { ...notification, read: true }
              : notification
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
        return true;
      }
    } catch (error) {
      console.error('Erro ao marcar como lida:', error);
      return false;
    }
  }, []);

  // Marcar todas como lidas
  const markAllAsRead = useCallback(async () => {
    try {
      const response = await apiService.markAllAsRead();
      
      if (response.success) {
        setNotifications(prev => 
          prev.map(notification => ({ ...notification, read: true }))
        );
        setUnreadCount(0);
        return true;
      }
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error);
      return false;
    }
  }, []);

  // Carregar configurações
  const loadSettings = useCallback(async () => {
    try {
      const response = await apiService.getNotificationSettings();
      if (response.success) {
        setSettings(response.data);
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    }
  }, []);

  // Atualizar configurações
  const updateSettings = useCallback(async (newSettings) => {
    try {
      const response = await apiService.updateNotificationSettings(newSettings);
      
      if (response.success) {
        setSettings(response.data);
        return { success: true };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('Erro ao atualizar configurações:', error);
      return { success: false, message: error.message };
    }
  }, []);

  // Carregar dados iniciais
  useEffect(() => {
    loadNotifications();
    loadUnreadCount();
    loadSettings();
  }, [loadNotifications, loadUnreadCount, loadSettings]);

  // Atualizar contador periodicamente
  useEffect(() => {
    const interval = setInterval(loadUnreadCount, 30000); // 30 segundos
    return () => clearInterval(interval);
  }, [loadUnreadCount]);

  return {
    notifications,
    unreadCount,
    loading,
    settings,
    loadNotifications,
    loadUnreadCount,
    markAsRead,
    markAllAsRead,
    loadSettings,
    updateSettings
  };
};

