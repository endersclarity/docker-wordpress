'use client';

import { useState, useCallback } from 'react';
import { ModalState } from '@/types/cottage-search';

/**
 * Custom hook for managing property modal state
 */
export function useModal() {
  const [modalState, setModalState] = useState<ModalState>({
    isOpen: false,
    property: null,
  });

  const openModal = useCallback((property: any) => {
    setModalState({
      isOpen: true,
      property,
    });
  }, []);

  const closeModal = useCallback(() => {
    setModalState({
      isOpen: false,
      property: null,
    });
  }, []);

  return {
    modalState,
    openModal,
    closeModal,
  };
}