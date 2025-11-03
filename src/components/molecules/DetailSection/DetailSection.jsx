import React from 'react';
import PropTypes from 'prop-types';
import './DetailSection.css';

/**
 * Reusable detail section component
 * Displays a titled section with grid layout for detail items
 */
export const DetailSection = ({ title, children, className = '', style = {} }) => {
  return (
    <div className={`detail-section ${className}`} style={style}>
      {title && <h4 className="detail-section-title">{title}</h4>}
      {children}
    </div>
  );
};

DetailSection.propTypes = {
  title: PropTypes.string,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  style: PropTypes.object
};

export default DetailSection;
