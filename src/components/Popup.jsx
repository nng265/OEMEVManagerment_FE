import React from 'react';
import PropTypes from 'prop-types';
import Button from './atoms/Button/Button';
import './Popup.css';

const Popup = ({
  show,
  onClose,
  title,
  size = 'lg',
  children,
  footerButtons = [],
  centered = true,
  backdrop = 'static',
  animation = true,
  className = '',
  closeButton = true,
  closeOnEsc = true,
  closeOnBackdrop = false
}) => {
  React.useEffect(() => {
    const handleEsc = (e) => {
      if (closeOnEsc && e.key === 'Escape') {
        onClose();
      }
    };

    if (show) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [show, closeOnEsc, onClose]);

  if (!show) return null;

  const handleBackdropClick = (e) => {
    if (closeOnBackdrop && e.target === e.currentTarget) {
      onClose();
    }
  };

  const modalClasses = [
    'modal',
    animation && 'fade',
    show && 'show',
    `modal-${size}`,
    className
  ].filter(Boolean).join(' ');

  return (
    <>
      <div 
        className={modalClasses}
        onClick={handleBackdropClick}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className={`modal-dialog ${centered ? 'modal-dialog-centered' : ''}`}>
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="modal-title">{title}</h5>
              {closeButton && (
                <button
                  type="button"
                  className="btn-close"
                  onClick={onClose}
                  aria-label="Close"
                />
              )}
            </div>

            <div className="modal-body">{children}</div>

            {footerButtons.length > 0 && (
              <div className="modal-footer">
                {footerButtons.map((btn, index) => (
                  <Button
                    key={index}
                    variant={btn.variant || 'secondary'}
                    onClick={btn.onClick}
                    className={btn.className}
                    disabled={btn.disabled}
                    isLoading={btn.isLoading}
                  >
                    {btn.label}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      {backdrop && <div className={`modal-backdrop fade ${show ? 'show' : ''}`} />}
        </>
  );
};

Popup.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl']),
  children: PropTypes.node.isRequired,
  footerButtons: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      variant: PropTypes.string,
      onClick: PropTypes.func.isRequired,
      className: PropTypes.string,
      disabled: PropTypes.bool,
      isLoading: PropTypes.bool
    })
  ),
  centered: PropTypes.bool,
  backdrop: PropTypes.oneOf(['static', true, false]),
  animation: PropTypes.bool,
  className: PropTypes.string,
  closeButton: PropTypes.bool,
  closeOnEsc: PropTypes.bool,
  closeOnBackdrop: PropTypes.bool
};

export default Popup;



