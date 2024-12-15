import React from 'react';
// import { _isArrary, _isObject } from '../Utill/commonUtill'; // Adjust path if needed
import './App.css';

// import React from 'react';
// import { _isArrary, _isObject } from '../Utill/commonUtill'; // Adjust path if needed
// import './i360-component-style.css';

export const _isArray = (value) => Array.isArray(value);
export const _isObject = (value) => value && typeof value === 'object' && !Array.isArray(value);

export default class Select extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            tempvalue: null,
            filterValue: '',
            isOpened: false,
            isFloated: false,
        };

        // Ensure methods are bound to the class instance
        this.textInput = React.createRef();
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleClickOutside = this.handleClickOutside.bind(this);
    }

    componentDidMount() {
        document.addEventListener("keydown", this.handleKeyDown, false);
        document.addEventListener('mousedown', this.handleClickOutside, false);
        let val = _isObject(this.props.value) ? this.props.value.label : this.props.value;
        this.setState({ filterValue: val, value: val });
    }

    componentWillUnmount() {
        document.removeEventListener("keydown", this.handleKeyDown, false);
        document.removeEventListener('mousedown', this.handleClickOutside, false);
    }

    componentDidUpdate(prevProps, prevState) {
        if ((this.props.value !== prevProps.value) || (this.props.value === null && prevProps.value)) {
            let val = _isObject(this.props.value) ? this.props.value.label : this.props.value;
            this.setState({ filterValue: val, value: val });

            if (val === null || val.length == 0) {
                this.setState({ tempvalue: null });
            }
        }
    }

    handleClickOutside(e) {
        if (this.state.isOpened && this.handleDocumentClickRef && this.handleDocumentClickRef.contains(e.target) === false) {
            if (this.state.tempvalue === null) {
                this.handleFloatLabel(false);
            }
            this.setState({ isOpened: false });
        } else if (e.target && e.target.id && this.textInput
            && !this.state.isOpened && this.textInput.current &&
            this.textInput.current.id && e.target.id === this.textInput.current.id) {
            this.setState({ isOpened: true });
        }
    }

    handleKeyDown(e) {
        const keyCodes = [40, 38, 13, 9];
        const { keyCode } = e;
        let { tempvalue } = this.state;
        const { option } = this.props;
        let values = [];
        if (option.length >= 1 && typeof (option[0]) === 'object') {
            values = option.map(item => item.value);
        } else {
            values = option;
        }

        if (this.state.isOpened && keyCodes.includes(keyCode)) {
            if ((keyCode === 38 || keyCode === 40 || keyCode === 13) && tempvalue === null) {
                tempvalue = values[0];
            } else if (keyCode === 40) {
                let index = values.indexOf(tempvalue);
                tempvalue = index === (values.length - 1) ? values[0] : values[index + 1];
            } else if (keyCode === 38) {
                let index = values.indexOf(tempvalue);
                tempvalue = index === 0 ? values[values.length - 1] : values[index - 1];
            } else if (keyCode === 13) {
                this.setState({
                    isOpened: false
                }, () => {
                    this.textInput.current.blur();
                    this.props.handleOnChange(option.find(el => el.value === tempvalue));
                });
            } else if (keyCode === 9) {
                if (this.state.tempvalue === null) {
                    this.handleFloatLabel(false);
                }
                this.setState({ isOpened: false });
            }
        }
        this.setState({ tempvalue });
    }

    handleChange(e, value) {
        e.preventDefault();
        this.setState({
            isOpened: false,
            filterValue: value.value ? value.label : value,
            tempvalue: value.value ? value.value : value
        }, () => {
            this.props.handleOnChange(value);
        });
    }

    handleFocus = (event) => {
        this.setState({ isOpened: true });
    }

    handleBlur() {
        this.setState({ isOpened: false });
    }

    renderOption(option, value, tempvalue, filterValue, isSearchable) {
        let notfound = 0;
        if (option.length >= 1 && typeof (option[0]) === 'object') {
            return option.map((item, i) => {
                if (!this.props.isAutoComplete && isSearchable && filterValue && filterValue.trim().length >= 1) {
                    if ((typeof item.label === "string" && item.label.toUpperCase().includes(filterValue.toUpperCase()))
                        || (typeof item.label === "number" && item.label === Number(filterValue))
                        || (typeof item.value === "string" && item.value.toUpperCase().includes(filterValue.toUpperCase()))
                        || (typeof item.vlaue === "number" && item.value === Number(filterValue))) {
                        return (
                            <li
                                key={'select' + i}
                                onClick={(e) => this.handleChange(e, item)}
                                className={`material_custom_select_item ${tempvalue === item.value ? 'active_item' : ''}`}
                                data-index={i + 1}>{item.label}</li>
                        );
                    } else {
                        notfound++;
                        if (notfound === option.length) {
                            return (
                                <li key="no-result-key" className="material_custom_select_item">
                                    <span>{"Not Found"}</span>
                                </li>
                            );
                        } else {
                            return null;
                        }
                    }
                } else {
                    return (
                        <li
                            key={'select' + i}
                            onClick={(e) => this.handleChange(e, item)}
                            className={`material_custom_select_item ${tempvalue === item.value ? 'active_item' : ''}`}
                            data-index={i + 1}>{item.label}</li>
                    );
                }

            });
        } else {
            return option.map((item, i) => {
                if (isSearchable && filterValue.trim().length >= 1) {
                    if (item.toUpperCase().includes(filterValue.toUpperCase())) {
                        return (
                            <li
                                key={'select' + i}
                                onClick={(e) => this.handleChange(e, item)}
                                className={`material_custom_select_item ${tempvalue === item ? 'active_item' : ''}`}
                                data-index={i + 1}>{item}</li>
                        );
                    } else {
                        notfound++;
                        if (notfound === option.length) {
                            return (
                                <li key="no-result-key" className="material_custom_select_item">
                                    <span>{"Not Found"}</span>
                                </li>
                            );
                        } else {
                            return null;
                        }
                    }
                } else {
                    return (
                        <li
                            key={'select' + i}
                            onClick={(e) => this.handleChange(e, item)}
                            className={`material_custom_select_item ${tempvalue === item ? 'active_item' : ''}`}
                            data-index={i + 1}>{item}</li>
                    );
                }
            });
        }
    }

    handleFloatLabel(value) {
        this.setState({ isFloated: value });
    }

    handleSearch = (evt) => {
        const { isAutoComplete, isSearchable } = this.props;
        if (isSearchable && !isAutoComplete) {
            this.setState({ filterValue: evt.target.value });
        } else if (isSearchable && isAutoComplete) {
            this.setState({ filterValue: evt.target.value });
            this.props.hanldeAutoComplete(evt.target.value);
        }
        if (isSearchable) {
            if (!this.state.isOpened) {
                this.setState({ isOpened: true });
            }
            if (evt.target.value.length === 0) {
                this.props.handleOnChange({ label: '', value: '' });
            }
        }
    }

    render() {
        const { isOpened, tempvalue, isFloated, filterValue } = this.state;
        const { option, label, value, inputId, isSearchable, placeholderValue, transition, disabled, style } = this.props;

        return (
            <div className={`select_wrapper_material ${isOpened ? 'opened' : ''} ${isFloated ? 'floated' : ''} ${style}`}>
                <div className="new-form">
                    <label
                        htmlFor={inputId}
                        className="select_label">
                        <span className="label-text">{label}</span>
                        <span className="down_arrow">
                            <span className="icon dropdown"></span>
                        </span>
                    </label>
                    <input type="text"
                        value={filterValue}
                        id={inputId}
                        placeholder={placeholderValue}
                        disabled={disabled ? true : false}
                        ref={this.textInput}
                        autoComplete="new-off"
                        onFocus={(event) => [
                            event.target.setAttribute('autocomplete', 'off'),
                            this.handleFocus(event),
                            this.handleFloatLabel(transition)]}
                        readOnly={!isSearchable}
                        onChange={this.handleSearch}
                        className="combo_input" />
                </div>

                <ul
                    ref={node => (this.handleDocumentClickRef = node)}
                    className="material_custom_select"
                    {...(this.props.height && { style: { height: this.props.height } })}
                >
                    {this.renderOption(option, value, tempvalue, filterValue, isSearchable)}
                </ul>

            </div>
        );
    }
}

Select.defaultProps = {
    value: '',
    label: '',
    effect: 'effect_1',
    disabled: false,
    readOnly: false,
    option: [],
    isSearchable: false,
    multi: false,
    isAutoComplete: false,
    maxCount: 0,
    placeholderValue: '',
    transition: false,
    style: ''
};
