import { useState } from 'react';

export function useModals() {
  const [activeModal, setActiveModal] = useState(null);
  const [modalContent, setModalContent] = useState("");
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [modalMedia, setModalMedia] = useState(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showAgendaSettings, setShowAgendaSettings] = useState(false);
  const [showFullMap, setShowFullMap] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [expandedHelp, setExpandedHelp] = useState(null);
  const [confirmConfig, setConfirmConfig] = useState({ isOpen: false, title: "", message: "", onConfirm: () => {} });

  const triggerConfirm = (title, message, onConfirm) => 
    setConfirmConfig({ isOpen: true, title, message, onConfirm });

  return {
    activeModal, setActiveModal,
    modalContent, setModalContent,
    isModalLoading, setIsModalLoading,
    modalMedia, setModalMedia,
    showAdmin, setShowAdmin,
    showAgendaSettings, setShowAgendaSettings,
    showFullMap, setShowFullMap,
    showHelp, setShowHelp,
    expandedHelp, setExpandedHelp,
    confirmConfig, setConfirmConfig,
    triggerConfirm,
  };
}
