import React from 'react';

// Real text nodes and ordinary spaces preserve selection, names, and line wrapping.
export default function AnimatedWords({ children }) {
  if (typeof children !== 'string') return children;
  return <span className="motion-text">{children.split(/(\s+)/).map((word, index) => (
    /^\s+$/.test(word) ? word : <span className="motion-word" key={index}>{word}</span>
  ))}</span>;
}
