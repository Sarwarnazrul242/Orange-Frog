// src/components/admin/MultiSelect.js
import React, { useState, useEffect } from "react";
import { default as ReactSelect, components } from "react-select";

const MultiSelect = (props) => {
  const [selectInput, setSelectInput] = useState("");
  const [allSelected, setAllSelected] = useState(false); // Track the "Select All" checkbox state

  // Filter options based on input
  // const filterOptions = (options, input) =>
  //   options?.filter(({ label }) =>
  //     label.toLowerCase().includes(input.toLowerCase())
  //   );

  // const comparator = (v1, v2) => (v1.value - v2.value);

  // let filteredOptions = filterOptions(props.options, selectInput);

  // Custom Option component with a checkbox
  const Option = (optionProps) => {
    const { value, label } = optionProps.data;
    const isAllOption = value === "*";

    // Trigger handleSelectAll for "Select All" option when clicked
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
        <input
          type="checkbox"
          checked={isAllOption ? allSelected : optionProps.isSelected}
          readOnly
          style={{ marginRight: "8px" }}
        />
        <label>{label}</label>
      </components.Option>
    );
  };

  const Input = (inputProps) => (
    <>
      {selectInput.length === 0 ? (
        <components.Input autoFocus={inputProps.selectProps.menuIsOpen} {...inputProps}>
          {inputProps.children}
        </components.Input>
      ) : (
        <div style={{ border: "1px dotted gray" }}>
          <components.Input autoFocus={inputProps.selectProps.menuIsOpen} {...inputProps}>
            {inputProps.children}
          </components.Input>
        </div>
      )}
    </>
  );

  const onInputChange = (inputValue, { action }) => {
    if (action === "input-change") setSelectInput(inputValue);
    else if (action === "menu-close" && selectInput !== "") setSelectInput("");
  };

  const handleSelectAll = () => {
    if (allSelected) {
      // Deselect all
      setAllSelected(false);
      props.onChange([]);
    } else {
      // Select all options
      setAllSelected(true);
      props.onChange(props.options);
    }
  };

  const handleChange = (selected) => {
    // Update "Select All" state based on selection
    if (selected.length === props.options.length) {
      setAllSelected(true);
    } else {
      setAllSelected(false);
    }
    props.onChange(selected);
  };

  const customStyles = {
    multiValueLabel: (def) => ({
      ...def,
      backgroundColor: "lightgray",
    }),
    multiValueRemove: (def) => ({
      ...def,
      backgroundColor: "lightgray",
    }),
    valueContainer: (base) => ({
      ...base,
      maxHeight: "65px",
      overflow: "auto",
    }),
    option: (styles, { isSelected }) => ({
      ...styles,
      display: "flex",
      alignItems: "center",
      backgroundColor: isSelected ? "#c3c8c9" : "white",
    }),
    menu: (def) => ({ ...def, zIndex: 9999 }),
  };

  useEffect(() => {
    // Check if all options are selected to automatically mark "Select All"
    const allSelectedStatus =
      props.value && props.value.length === props.options.length;
    setAllSelected(allSelectedStatus);
  }, [props.value, props.options]);

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
      closeMenuOnSelect={false} // Keep dropdown open on selection
      hideSelectedOptions={false}
    />
  );
};

export default MultiSelect;
