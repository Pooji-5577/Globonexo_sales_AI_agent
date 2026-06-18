'use client';

import { useState } from 'react';
import { Icon } from './Icon';

export function Field({ label, icon, type = 'text', placeholder, value, onChange, toggle, hint, name, required, autoComplete }) {
  const [show, setShow] = useState(false);
  const realType = toggle ? (show ? 'text' : 'password') : type;
  return (
    <div className="field">
      {label && <label>{label}</label>}
      <div className="input-wrap">
        {icon && <span className="lead-ico"><Icon name={icon} size={19} /></span>}
        <input
          className={'input' + (icon ? ' has-ico' : '')}
          type={realType}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          autoComplete={autoComplete}
        />
        {toggle && (
          <button className="trail" type="button" onClick={() => setShow((s) => !s)} aria-label="toggle password">
            <Icon name={show ? 'eyeoff' : 'eye'} size={19} />
          </button>
        )}
      </div>
      {hint && <span style={{ fontSize: 12.5, color: 'var(--faint)' }}>{hint}</span>}
    </div>
  );
}

export default Field;
