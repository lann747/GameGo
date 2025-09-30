import React, { useEffect, useState } from "react";
import {
  FaCheckCircle,
  FaExclamationTriangle,
  FaInfoCircle,
  FaTimesCircle,
  FaTimes,
} from "react-icons/fa";

const Alert = ({
  message,
  type = "info",
  onClose,
  autoClose = 5000,
  position = "top-right", // "top-right" | "top-left" | "top-center" | "bottom-right" | "bottom-left" | "bottom-center"
  title,
  action,
  persistent = false,
}) => {
  const [visible, setVisible] = useState(!!message);
  const [progress, setProgress] = useState(100);
  const [isPaused, setIsPaused] = useState(false);

  // Alert type configurations
  const typeConfig = {
    success: {
      icon: <FaCheckCircle />,
      bgColor: "linear-gradient(135deg, #48bb78, #38a169)",
      iconColor: "#48bb78",
      progressColor: "#48bb78",
    },
    error: {
      icon: <FaTimesCircle />,
      bgColor: "linear-gradient(135deg, #e53e3e, #c53030)",
      iconColor: "#e53e3e",
      progressColor: "#e53e3e",
    },
    warning: {
      icon: <FaExclamationTriangle />,
      bgColor: "linear-gradient(135deg, #ed8936, #dd6b20)",
      iconColor: "#ed8936",
      progressColor: "#ed8936",
    },
    info: {
      icon: <FaInfoCircle />,
      bgColor: "linear-gradient(135deg, #4299e1, #3182ce)",
      iconColor: "#4299e1",
      progressColor: "#4299e1",
    },
  };

  const config = typeConfig[type] || typeConfig.info;

  // Position styles
  const positionStyles = {
    "top-right": { top: "20px", right: "20px", left: "auto" },
    "top-left": { top: "20px", left: "20px", right: "auto" },
    "top-center": { top: "20px", left: "50%", transform: "translateX(-50%)" },
    "bottom-right": { bottom: "20px", right: "20px", left: "auto" },
    "bottom-left": { bottom: "20px", left: "20px", right: "auto" },
    "bottom-center": {
      bottom: "20px",
      left: "50%",
      transform: "translateX(-50%)",
    },
  };

  // Auto close with progress bar
  useEffect(() => {
    if (!message || persistent || !autoClose) return;

    setVisible(true);
    setProgress(100);

    const intervalTime = 50;
    const totalIntervals = autoClose / intervalTime;
    const decrement = 100 / totalIntervals;

    const progressInterval = setInterval(() => {
      if (!isPaused) {
        setProgress((prev) => {
          const newProgress = prev - decrement;
          if (newProgress <= 0) {
            clearInterval(progressInterval);
            handleClose();
            return 0;
          }
          return newProgress;
        });
      }
    }, intervalTime);

    return () => clearInterval(progressInterval);
  }, [message, autoClose, persistent, isPaused]);

  const handleClose = () => {
    setVisible(false);
    setTimeout(() => onClose?.(), 300);
  };

  const handleMouseEnter = () => {
    if (autoClose && !persistent) {
      setIsPaused(true);
    }
  };

  const handleMouseLeave = () => {
    if (autoClose && !persistent) {
      setIsPaused(false);
    }
  };

  if (!visible || !message) return null;

  return (
    <div
      className={`alert-container ${visible ? "alert-enter" : "alert-exit"}`}
      style={positionStyles[position]}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Progress Bar */}
      {autoClose && !persistent && (
        <div
          className="alert-progress"
          style={{
            background: config.progressColor,
            width: `${progress}%`,
          }}
        />
      )}

      {/* Alert Content */}
      <div className="alert-content" style={{ background: config.bgColor }}>
        {/* Icon */}
        <div className="alert-icon" style={{ color: config.iconColor }}>
          {config.icon}
        </div>

        {/* Message */}
        <div className="alert-body">
          {title && <h4 className="alert-title">{title}</h4>}
          <p className="alert-message">{message}</p>

          {/* Action Button */}
          {action && (
            <button
              className="alert-action"
              onClick={action.onClick}
              style={{ color: config.iconColor }}
            >
              {action.label}
            </button>
          )}
        </div>

        {/* Close Button */}
        <button
          className="alert-close"
          onClick={handleClose}
          aria-label="Close alert"
        >
          <FaTimes />
        </button>
      </div>
    </div>
  );
};

export default Alert;
