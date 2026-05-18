import "../styles/modal.css";

function ConfirmModal({
  isOpen,

  title,

  message,

  onConfirm,

  onCancel,
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-title">{title}</div>

        <div className="modal-message">{message}</div>

        <div className="modal-buttons">
          <button className="cancel-btn" onClick={onCancel}>
            Отмена
          </button>

          <button className="confirm-btn" onClick={onConfirm}>
            Подтвердить
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;
