// src/components/admin/MultiSelect.js
import React, { useState, useEffect } from "react";
import { default as ReactSelect, components } from "react-select";

const MultiSelect = (props) => {
  const [selectInput, setSelectInput] = useState("");
  const [allSelected, setAllSelected] = useState(false);

  // Custom Option component with a checkbox
  const Option = (optionProps) => {
    const { value, label } = optionProps.data;
    const isAllOption = value === "*";

    const handleOptionClick = (e) => {
      e.stopPropagation();
      if (isAllOption) {
        handleSelectAll();
      } else {
        optionProps.selectOption(optionProps.data);
      }
    };

    return (
      <components.Option {...optionProps} innerProps={{ ...optionProps.innerProps, onClick: handleOptionClick }}>
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={isAllOption ? allSelected : optionProps.isSelected}
            readOnly
            className="h-4 w-4 rounded border-neutral-600 bg-neutral-700 text-orange-500 focus:ring-orange-500 focus:ring-offset-neutral-800"
          />
          <label className="text-neutral-200">{label}</label>
        </div>
      </components.Option>
    );
  };

  const Input = (inputProps) => (
    <components.Input 
      {...inputProps} 
      className="text-white placeholder-neutral-400"
      autoFocus={inputProps.selectProps.menuIsOpen}
    >
      {inputProps.children}
    </components.Input>
  );

  const onInputChange = (inputValue, { action }) => {
    if (action === "input-change") setSelectInput(inputValue);
    else if (action === "menu-close" && selectInput !== "") setSelectInput("");
  };

  const handleSelectAll = () => {
    if (allSelected) {
      setAllSelected(false);
      props.onChange([]);
    } else {
      setAllSelected(true);
      props.onChange(props.options);
    }
  };

  const handleChange = (selected) => {
    if (selected.length === props.options.length) {
      setAllSelected(true);
    } else {
      setAllSelected(false);
    }
    props.onChange(selected);
  };

  const customStyles = {
    control: (base, state) => ({
      ...base,
      backgroundColor: '#262626', // neutral-800
      borderColor: state.isFocused ? '#525252' : '#404040', // neutral-600/neutral-700
      boxShadow: state.isFocused ? '0 0 0 1px #525252' : 'none',
      '&:hover': {
        borderColor: '#525252' // neutral-600
      }
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: '#262626', // neutral-800
      border: '1px solid #404040', // neutral-700
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      zIndex: 9999
    }),
    option: (base, { isSelected, isFocused }) => ({
      ...base,
      backgroundColor: isSelected 
        ? '#404040' // neutral-700
        : isFocused 
          ? '#363636' // neutral-750
          : '#262626', // neutral-800
      color: '#e5e5e5', // neutral-200
      '&:active': {
        backgroundColor: '#404040' // neutral-700
      }
    }),
    multiValue: (base) => ({
      ...base,
      backgroundColor: '#404040', // neutral-700
    }),
    multiValueLabel: (base) => ({
      ...base,
      color: '#e5e5e5', // neutral-200
    }),
    multiValueRemove: (base) => ({
      ...base,
      color: '#9ca3af', // neutral-400
      '&:hover': {
        backgroundColor: '#525252', // neutral-600
        color: '#e5e5e5' // neutral-200
      }
    }),
    clearIndicator: (base) => ({
      ...base,
      color: '#9ca3af', // neutral-400
      '&:hover': {
        color: '#e5e5e5' // neutral-200
      }
    }),
    dropdownIndicator: (base) => ({
      ...base,
      color: '#9ca3af', // neutral-400
      '&:hover': {
        color: '#e5e5e5' // neutral-200
      }
    }),
    valueContainer: (base) => ({
      ...base,
      maxHeight: '65px',
      overflow: 'auto',
      padding: '2px 6px',
      color: '#e5e5e5' // neutral-200
    }),
    placeholder: (base) => ({
      ...base,
      color: '#9ca3af' // neutral-400
    }),
    noOptionsMessage: (base) => ({
      ...base,
      color: '#9ca3af' // neutral-400
    }),
    loadingMessage: (base) => ({
      ...base,
      color: '#9ca3af' // neutral-400
    }),
  };

  return (
    <ReactSelect
      {...props}
      inputValue={selectInput}
      onInputChange={onInputChange}
      options={[
        {
          label: "Select All",
          value: "*",
        },
        ...props.options,
      ]}
      onChange={handleChange}
      components={{ Option, Input, ...props.components }}
      menuPlacement={props.menuPlacement ?? "auto"}
      styles={customStyles}
      isMulti
      closeMenuOnSelect={false}
      hideSelectedOptions={false}
      theme={(theme) => ({
        ...theme,
        colors: {
          ...theme.colors,
          primary: '#F16636', // Orange Frog orange
          primary75: '#F16636cc',
          primary50: '#F1663680',
          primary25: '#F1663640',
        },
      })}
    />
  );
};

export default MultiSelect;
