import React from "react";

/**
 * Separator
 * - 단순 구분자 (예: Footer의 "·" 점 구분)
 */
const Separator = ({ className = "" }) => {
    return (
        <span
            aria-hidden="true"
            className={`select-none font-extrabold text-base leading-none opacity-50 ${className}`}
        >
      ·
    </span>
    );
};

export default Separator;
