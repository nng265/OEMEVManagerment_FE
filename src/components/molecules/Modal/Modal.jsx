import React, { useEffect, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import './Modal.css';
import { Button } from '../../atoms/Button/Button';

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showFooter = true,
  onConfirm,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'primary',
  isLoading = false,
  closeOnClickOutside = true,
  closeOnEsc = true,
  showCloseButton = true,
  centered = false,
  scrollable = false,
  backdrop = true,
  animation = true,
  onOpened,
  onClosed,
  className = '',
  headerClassName = '',
  bodyClassName = '',
  footerClassName = ''
}) => {
  const modalRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    if (isOpen && onOpened) {
      onOpened();
    }
    if (!isOpen && onClosed) {
      onClosed();
    }
  }, [isOpen, onOpened, onClosed]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (closeOnEsc && isOpen && e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [isOpen, closeOnEsc, onClose]);

  const handleBackdropClick = useCallback((e) => {
    if (
      closeOnClickOutside &&
      modalRef.current &&
      contentRef.current &&
      !contentRef.current.contains(e.target)
    ) {
      onClose();
    }
  }, [closeOnClickOutside, onClose]);

  if (!isOpen) return null;

  const modalClasses = [
    'modal',
    animation && 'fade',
    'show',
    `modal-${size}`,
    centered && 'modal-dialog-centered',
    scrollable && 'modal-dialog-scrollable',
    className
  ].filter(Boolean).join(' ');

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
  };

  return (
    <>
      <div
        ref={modalRef}
        className={modalClasses}
        style={{ display: 'block' }}
        onClick={handleBackdropClick}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="modal-dialog">
          <div ref={contentRef} className="modal-content">
            <div className={`modal-header ${headerClassName}`}>
              <h5 className="modal-title" id="modal-title">{title}</h5>
              {showCloseButton && (
                <button
                  type="button"
                  className="btn-close"
                  onClick={onClose}
                  aria-label="Close"
                />
              )}
            </div>
            <div className={`modal-body ${bodyClassName}`}>
              {children}
            </div>
            {showFooter && (
              <div className={`modal-footer ${footerClassName}`}>
                <Button
                  variant="secondary"
                  onClick={onClose}
                  disabled={isLoading}
                >
                  {cancelText}
                </Button>
                {onConfirm && (
                  <Button
                    variant={confirmVariant}
                    onClick={handleConfirm}
                    isLoading={isLoading}
                  >
                    {confirmText}
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      {backdrop && <div className="modal-backdrop fade show"></div>}
    </>
  );
};

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl']),
  showFooter: PropTypes.bool,
  onConfirm: PropTypes.func,
  confirmText: PropTypes.string,
  cancelText: PropTypes.string,
  confirmVariant: PropTypes.string,
  isLoading: PropTypes.bool,
  closeOnClickOutside: PropTypes.bool,
  closeOnEsc: PropTypes.bool,
  showCloseButton: PropTypes.bool,
  centered: PropTypes.bool,
  scrollable: PropTypes.bool,
  backdrop: PropTypes.bool,
  animation: PropTypes.bool,
  onOpened: PropTypes.func,
  onClosed: PropTypes.func,
  className: PropTypes.string,
  headerClassName: PropTypes.string,
  bodyClassName: PropTypes.string,
  footerClassName: PropTypes.string
};

export default Modal;
