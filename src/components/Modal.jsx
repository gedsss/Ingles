import { useEffect, useState } from 'react';

// Mantém o último conteúdo durante a animação de fechamento.
export default function Modal({ open, onClose, children }) {
  const [content, setContent] = useState(children);

  useEffect(() => { if (open) setContent(children); }, [open, children]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <div className={`modal ${open ? 'show' : ''}`} aria-hidden={!open} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">{open ? children : content}</div>
    </div>
  );
}
