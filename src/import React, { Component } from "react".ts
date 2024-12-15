import React, { Component } from "react";
import "./RoleMapping.css";
import "../App.css";
// import "@vzrf/form/dist/index.css";
// import "@vzrf/button/dist/index.css";
// import "../css/ManageAccess/ManageAccess.css";

import { Grid, Row, Col } from "@vzrf/react-grid";
import { connect } from "react-redux";
import Alert from "react-bootstrap/Alert";
import _ from "lodash";
import Loader from "../VbapComponents/UI/Loader/Loader";
import MenuCheckbox from "./MenuCheckbox";
import { getAllRoles } from "../actions/LoginActions";
import {
  getAllMenus, getMenusByRoleID,
  setMenuIds, getRolePrivileges,
  clearRoleMapping, setPrivilegeIds,
  assignRoleMenus, assignPrivilege,
  getRoleNames, submitNewRole,
  clearRoleMsg, getLandingPageValues, clearDeactivateMsg, muiTableClearSearch,
  submitNewTabMenu, updateTabMenuDetails, setLoader, getUsersListMappedWithRole, muiTableStoreFilterInit, muiTableStoreColumnData, muiTableUpdatePage, muiTableUpdateFilter, fnremoveRoleMappedWithUser, fndeactivateUser
} from "../actions/RoleMappingActions";
import MUIDataTable from "mui-datatables";
import { MuiThemeProvider, createMuiTheme } from "@material-ui/core/styles";
import { sortTableHelper, filterSubmitHelper, columnsGenerator, getColumnIndexHelper, getSelectedFilter } from "../Utility/MuiDataTableUtil";
import { refreshUserRole } from '../actions/ManageAccessActions';
import { withRouter } from "react-router-dom";
import MenuValidator from "../component/common/MenuValidator";
import Modal from "../component/UI/Modal";
import Tree from 'rc-tree';
import { setFirstTab } from "../actions/TabActions";
import profile from "../images/new_db.svg";
import addFolder from "../img/add-folder.svg";
import {ReactSelectAim} from '../../src/AIM/Components/index';
import { searchUserTag } from "../actions/CommonAction";


const defaultTreeData = []

class RoleMapping extends Component {
  constructor(props) {
    super(props);
    this.props = props;

    this.state = {
      menuIdsClicked: [],
      disableSubmit: false,
      submitSuccess: false,
      roleSelected: "",
      roleCheckBox: false,
      loading: false,
      treeData: [],
      isroleSA: 'DSA',
      users: [],
      whitelistData: [],
      parentWhitelistData: [],
      isUpdated: false,
      showSpinner: false,
      selectedRoleId: '',
      SelectedMenus: [],
      SelectedMenusParents: [],
      ExpandedMenus: ["tab1"],
      isTreeEnabled: true,
      initialLoad: true,
      openModal: false,
      modalTitle: '',
      modalAction: '',
      domainName: '',
      roleType: '',
      location: '',
      isControlled: '',
      customDomainName: '',
      customRoleType: '',
      selectedMenuNode: undefined,
      selectedMenuType: '',
      selectedMenuId: undefined,
      level: '',
      menuName: '',
      tabName: '',
      menuOrder: undefined,
      menuUrl: '',
      landingPage: '',
      selectedIcon: '',
      showIcons: false,
      isOffshoreRestricted: false,
      appId: this.props.appId,
      userEID: null,
      selectedUsersList: [],
      openConfirmationModal: false,
      showMsg: false,
      alertMsg: '',
      showDeactivate: false,
      selectedName: '',
      isDeactivate: false,
      showusers: false,
      selectedRoleID: 0
    };
  }
  async componentDidMount() {
    if (this.props.currentRoleId) {
      await this.props.getAllRoles("Y");
      await this.props.getAllMenus();
      await this.setState({
        disableSubmit: false,
        roleCheckBox: true,
        loading: false
      });
      await this.props.getRolePrivileges(this.props.currentRoleId, this.props.appId);

      let users = [];
      let tabNames = this.props.roleMenus.tabNames;
      let menuArr = [];

      if (tabNames !== "undefined" && tabNames !== null) {
        Object.keys(tabNames).forEach(menuName => {
          menuArr.push(tabNames[menuName]);
        });

        this.setState({
          menuIdsClicked: menuArr,
          users,
          treeData: defaultTreeData
        });
      } else {
        return null;
      }
    } else {
      // this.props.history.push("/#");
      this.props.setFirstTab({ value: 'Home', url: '/' })
    }
    this.props.getRoleNames();
    this.props.getLandingPageValues();
    //this.props.getUsersListMappedWithRole(this.props.currentRoleId, this.props.appId);
  }

  componentWillUnmount() {
    this.props.clearRoleMapping();
    this.setState({
      roleSelected: ""
    });
    //NOTE:: Refresh user profile
    this.props.refreshUserRole();
  }

  static getDeriveStateFromProps(nextProps, prevState) {
    if (prevState.treeData !== nextProps.roleMappingMenus.profile) {
      return {
        treeData: nextProps.roleMappingMenus.profile
      }
    }
    return null;
  }

  checkMenus = p => this.props.menuIds.indexOf(p) >= 0;

  handleChange = e => {
    if (this.checkMenus(e.target.value)) {
      const menuIdsCopy = this.props.menuIds.slice();
      const index = this.props.menuIds.indexOf(e.target.value);
      menuIdsCopy.splice(index, 1);
      this.props.setMenuIds(menuIdsCopy);
    } else {
      this.props.setMenuIds(this.props.menuIds.concat([e.target.value]));
    }
  };

  submitClicked = async () => {
    const { treeData } = this.state;
    this.setState({
      disableSubmit: true,
      showSpinner: true,
      isroleSA: 'DSA',
      treeData: defaultTreeData
    });

    let parameter = [];

    this.state.SelectedMenusParents.forEach(id =>
      parameter.push({
        roleID: this.props.roleID,
        menuID: parseInt(id),
        appId: this.props.appId
      })
    );

    const privilegePayload = {
      roleID: this.props.roleID,
      profile: JSON.stringify(treeData)
    };

    await this.props.assignRoleMenus(parameter);
    await this.props.assignPrivilege(privilegePayload);

    this.props.setMenuIds([]);
    this.setState({
      submitSuccess: true,
      roleSelected: '',
      selectedRoleId: '',
      showSpinner: false,
      initialLoad: true,
      showIcons: false
    });
  }

  fnDeactivate = async () => {
    let selectedUsersCn = this.state.selectedUsersList.length;
    if (selectedUsersCn <= 0) {
      this.setState({ showMsg: true, alertMsg: 'Please select atleast one user to Proceed' })
    }
    else {
      this.setState({ openConfirmationModal: true, isDeactivate: true })
    }
  }

  showOrHideMenus = tabName => {
    const { menuIdsClicked } = this.state;

    if (!menuIdsClicked.includes(tabName)) {
      this.setState({
        menuIdsClicked: [...menuIdsClicked, tabName]
      });
    } else {
      this.setState({
        menuIdsClicked: menuIdsClicked.filter(id => id !== tabName)
      });
    }
  };

  onSelectRole = async e => {
    this.setState({
      treeData: defaultTreeData,
      initialLoad: false,
      submitSuccess: false
    });
    let roleID = null
    this.setState({
      roleSelected: e.target.value,
      roleCheckBox: false,
      disableSubmit: false
    });

    this.props.listOfRoles[0].roles.map(role => {
      if (role.rlName === e.target.value) {
        roleID = role.roleID
      }
    });

    if (roleID != null)
      await this.props.getMenusByRoleID(roleID);
    this.setState({ selectedRoleID: roleID });
    let SelectedMenus = [];
    let SelectedMenusParents = [];

    Object.keys(this.props.menuNames).map((menuKey, index) => {
      if (this.props.menuNames[menuKey].hasChildren == 'N')
        SelectedMenus.push("menu" + this.props.menuNames[menuKey].menuID.toString());

      SelectedMenusParents.push(this.props.menuNames[menuKey].menuID.toString());
    });

    await this.props.getRolePrivileges(roleID, this.props.appId);
    this.setState({
      selectedRoleId: roleID,
      treeData: this.props.roleMappingMenus.profile ? this.props.roleMappingMenus.profile : defaultTreeData,
      SelectedMenus: SelectedMenus,
      SelectedMenusParents: SelectedMenusParents,
      isTreeEnabled: false,
      showusers: true
    });

    this.props.getUsersListMappedWithRole(roleID, this.props.appId);
  }

  onExpand = (selected, targetNode) => {
    let menuid = targetNode.node.props.eventKey;
    let cloneExpandedMenus = JSON.parse(JSON.stringify(this.state.ExpandedMenus));
    if (cloneExpandedMenus.length > 0) {
      let index = cloneExpandedMenus.indexOf(menuid);
      if (index > -1) {
        cloneExpandedMenus = cloneExpandedMenus.filter(function (e) { return e !== menuid })
      }
      else {
        cloneExpandedMenus.push(menuid);
      }
    }
    else {
      cloneExpandedMenus.push(menuid);
    }
    this.setState({ ExpandedMenus: cloneExpandedMenus });
  }

  onSelect = (selected, targetNode) => {
    let menuid = targetNode.node.props.eventKey;
    let cloneExpandedMenus = JSON.parse(JSON.stringify(this.state.ExpandedMenus));
    if (cloneExpandedMenus.length > 0) {
      let index = cloneExpandedMenus.indexOf(menuid);
      if (index > -1) {
        cloneExpandedMenus = cloneExpandedMenus.filter(function (e) { return e !== menuid })
      }
      else {
        cloneExpandedMenus.push(menuid);
      }
    }
    else {
      cloneExpandedMenus.push(menuid);
    }
    let selectedMenuType = targetNode.node.props.menuID == undefined ? "TAB" : "MENU";
    let selectedMenuId = selectedMenuType == "TAB" ? targetNode.node.props.tabID : targetNode.node.props.menuID;
    let selectedMenuNode = targetNode.node.props;
    let showIcons = targetNode.selected;
    this.setState({
      ExpandedMenus: cloneExpandedMenus,
      selectedMenuType,
      selectedMenuId,
      selectedMenuNode,
      showIcons
    });
  }

  onCheck = (checked, targetNode) => {
    let checkedparent = [];
    for (let i = 0; i < targetNode.checkedNodes.length; i++) {
      if (targetNode.checkedNodes[i].key.indexOf("menu") > -1) {
        checkedparent.push(targetNode.checkedNodes[i].key.slice(4))
      }
    }

    for (let i = 0; i < targetNode.halfCheckedKeys.length; i++) {
      if (targetNode.halfCheckedKeys[i].indexOf("menu") > -1) {
        checkedparent.push(targetNode.halfCheckedKeys[i].slice(4))
      }
    }
    this.setState({ SelectedMenus: checked, SelectedMenusParents: checkedparent });
  }

  getExpandedKeys = (menus) => {
    let keys = [];
    for (let i = 0; i < menus.length; i++) {
      if (menus[i].children) {
        keys.push(menus[i].key);
        let childkeys = this.getExpandedKeys(menus[i].children)
        for (let j = 0; j < childkeys; j++) {
          keys.push(childkeys[j]);
        }
      }
    }
    return keys;
  }

  // added for a component
  handleChartDropDownList = (userSelectedList, additionalParams) => {      
    if(additionalParams && Object.keys(additionalParams).length > 0) {
      let updatedTree = _.cloneDeep(this.state.treeData)

      if(additionalParams.subLevelTwo) {
        let {tdIndex, subMenuIndex} = additionalParams;        
        updatedTree[tdIndex].subMenus[subMenuIndex].users = userSelectedList               
      } else {
        let {tdIndex} = additionalParams;        
        updatedTree[tdIndex].users = userSelectedList    
      }

      this.setState({ treeData : updatedTree });      
    }
   
}


clearOptionsAsyncHandler = (additionalParams) => {
  let {tdIndex, subMenuIndex} = additionalParams;   
  
  let updatedTree = _.cloneDeep(this.state.treeData)
  updatedTree[tdIndex].subMenus[subMenuIndex].users = []  

  this.setState({ treeData : updatedTree }); 
}

fetchUsers = async (value) => {                    
    let data = await this.props.searchUserTag(value);           
    data = data.map(el=>{
      return { vzeid : el.vzeid, value : el.fullName}
    });    
    return data;        
}

fetchUsersForTable = async (value) => {                    
  let data = await this.props.searchUserTag(value);           
  data = data.map(el=>{
    return { value : el.vzeid, label : el.fullName}
  });    
  return data;        
}

  showAllMenus = () => {
    if (Object.keys(this.props.roleMenus).length === 0) {
      return null;
    } else {
      let tabToMenu = this.props.roleMenus.tabToMenu;
      let tabNames = this.props.roleMenus.tabNames;
      let menuNames1 = this.props.roleMenus.menuNames;
      let menuwithChild = this.props.roleMenus.menuwithChild;
      //let expandedmenus = this.getExpandedKeys(menuwithChild);

      let menuNumbers = [];

      Object.keys(tabToMenu).forEach(key => {
        menuNumbers.push(tabToMenu[key]);
      });

      return (
        <MenuValidator>
          <React.Fragment>
            <div style={{ border: "1px solid #c8c8c8", minHeight: "300px", maxHeight: "300px" }}>
              <div style={{ borderBottom: "1px solid rgb(216, 218, 218)" }}>
                <h4 style={{ display: "inline-block", marginTop: "5px", marginLeft: "8px", fontWeight: "bold" }}>Assign Menus:</h4>
                {this.state.showIcons && <img style={{ marginRight: "10px" }} className="role-menu-icon" src={addFolder} onClick={() => this.openModalFun('Add Menu', 'ADD_MENU')} />}
                {this.state.showIcons && <img className="role-menu-icon" src={require("../img/mui/edit.svg")} onClick={() => this.openModalFun('Edit Menu', 'EDIT_MENU')} />}
              </div>
              <div
                className="form-group-mapping source-rolemap-tree custom-class"
                style={{ overflowY: "scroll", maxHeight: "255px" }}>
                <Tree
                  showLine
                  checkable
                  selectable={true}
                  // disabled={this.state.isTreeEnabled}
                  onExpand={this.onExpand}
                  onSelect={this.onSelect}
                  onCheck={this.onCheck}
                  treeData={menuwithChild}
                  defaultExpandAll
                  defaultcheckedKeys={this.state.SelectedMenus}
                  checkedKeys={this.state.SelectedMenus}
                  defaultExpandedKeys={this.state.ExpandedMenus}
                  expandedKeys={this.state.ExpandedMenus}
                />
                {/* {Object.keys(tabNames).map((menu, idx) => (
                  <div key={`${menu}-${idx}`}>
                    <div style={{ display: "flex" }}>
                      <p className="role_tabname"
                        style={{ cursor: "pointer", paddingRight: "0.25rem" }}
                        onClick={() => this.showOrHideMenus(tabNames[menu])}>
                        {
                          this.state.menuIdsClicked.includes(tabNames[menu]) ? (
                            <FaFolderOpen />
                          ) : (
                              <FaFolder />)
                        }
                      </p>
                      <label className="role_tabname">{tabNames[menu]}</label>
                    </div>
                    <div>
                      <Tree
                        showLine
                        checkable
                        selectable={false}
                        onCheck={this.onCheck}
                        treeData={menuwithChild.filter(function (i, n) {
                          return i.tabName === tabNames[menu];
                        })[0].children}
                        defaultExpandAll
                        checkedKeys={this.state.SelectedMenus}
                      />
                    </div>
                    {/* <ul className={  this.state.menuIdsClicked.includes(tabNames[menu]) ? "showCheckboxes" : "hideCheckboxes" }>
                      {
                        menuNumbers.map((num, i) => {
                          if (i === idx) {
                            return menuNumbers[i].map(number => {
                              return Object.keys(menuNames1).map(
                                (menuKey, index) => {
                                  if (number == menuKey) {
                                    return (
                                      <MenuCheckbox
                                        key={`${menuKey}-${index}`}
                                        name={menuNames1[menuKey]}
                                        menus={this.state.menus}
                                        checked={this.checkMenus(menuKey)}
                                        changed={this.handleChange}
                                        value={menuKey}
                                      />
                                    );
                                  }
                                }
                              );
                            });
                          }
                        })
                      }
                    </ul> 
                  </div>
                ))} */}
              </div>
            </div>
          </React.Fragment>
        </MenuValidator>
      )
    }
  }


  parentClicked = (name, td) => {
    const treeData = [...this.state.treeData];
    if (name === 'SA' || name === 'DSA') {
      this.setState({ isroleSA: name })
      this.state.treeData.map((list, i) => {
        this.state.treeData[i].hasPermission = name === 'SA' ? true : false;
      });
    } else {
      const selectedIndex = this.state.treeData.findIndex(
        f => f.profileName === name
      );
      const profile = { ...this.state.treeData[selectedIndex] };
      profile.hasPermission = !profile.hasPermission;
      if (profile.hasPermission === false) {
        treeData[selectedIndex] = profile;
        if (profile.subMenus !== undefined) {
          profile.subMenus.map(s => {
            s.hasPermission = false;
            s.users = [];
          });
        } else {
          profile.users = [];
        }
      } else {
        treeData[selectedIndex] = profile;
      }
    }

    this.setState({
      treeData
    });
  };

  childClicked = name => {
    let treeDataCopy = _.cloneDeep(this.state.treeData);
    
    treeDataCopy.forEach(data => {
    if (data.subMenus !== undefined) {
    const SelectedIndex = data.subMenus.findIndex( f => f.profileName === name );
    
    let profile = data.subMenus[SelectedIndex];
    if(profile) {
    profile.hasPermission = !profile.hasPermission;
    if(profile.hasPermission === false) {
    profile.users = [];
    }
    }
    }
    });
    this.setState({ treeData : treeDataCopy });
    };

  checkMenues = p => p === true;

  childChildMenues = cp => cp === true;

  userListCallback = (detail, sub) => {
    let selectedUsers = [];
    if (detail.tagify && detail.tagify.value.length === 0) {
      sub.users = [];
    } else {
      detail.tagify.value.map(m => {
        selectedUsers.push({
          vzeid: m.vzeid,
          value: m.value
        });
        sub.users = selectedUsers.filter(f => f.vzeid !== undefined);
      });
    }
  }

  showAllPrivileges = () => {
    const { treeData } = this.state;
    if (this.props.roleMappingMenus.fetching === true) {
      return <div>Loading...</div>;
    }
    if (!this.state.initialLoad) {
      if (Object.keys(treeData).length === 0) {
        return <h3 style={{ padding: "10px" }}>Loading...</h3>;
      } else {
        return (
          <div style={{ maxWidth: "75%", padding: "10px" }}>
            {treeData.map((td, tdIndex) => (
              <div key={td.profileName}>
                <MenuCheckbox
                  name={td.profileName}
                  value={td.hasPermission}
                  checked={this.checkMenues(td.hasPermission)}
                  changed={() => this.parentClicked(td.profileName, td)}
                />
                {td.hasPermission === true ? (
                  td.subMenus !== undefined ? (
                    td.subMenus.map((sub, subMenuIndex) => {
                      return (
                        <div key={sub.profileName} style={{ marginLeft: "50px" }}>
                          <MenuCheckbox
                            name={sub.profileName}
                            value={sub.profileName}
                            checked={this.childChildMenues(sub.hasPermission)}
                            changed={() =>
                              this.childClicked(sub.profileName, sub)
                            }
                          />
                          {sub.hasPermission === true ? (
                            <div>
                              <label className="Form-label label-spacing">
                                Assign only users should have this:
                              </label>
                              {/* <RoleMappingTag
                                value={sub.users}
                                selectedRole={this.state.selectedRoleId}
                                whitelist={this.state.whitelistData}
                                userListCallback={detail =>
                                  this.userListCallback(detail, sub)
                                } /> */}
                              <ReactSelectAim
                                  async={true}                            
                                  label = {''}
                                  placeholder = {'Search user'}                                            
                                  optionLabel= {'value'}
                                  optionValueLabel= {'vzeid'}
                                  handleSelectChange={this.handleChartDropDownList}                    
                                  value={sub.users}                                                          
                                  fetchOptions={this.fetchUsers}                      
                                  isMulti={true}
                                  additionalParams={{tdIndex, subMenuIndex, subLevelTwo : true} }
                                  isClearableCustom={true}
                                  clearOptionsAsyncHandler ={this.clearOptionsAsyncHandler}
                                  isClearable={false}
                              />                             
                            </div>
                          ) : null}
                        </div>
                      );
                    })
                  ) : (
                      <div style={{ marginLeft: "50px" }}>
                        <label className="Form-label label-spacing">
                          Assign only users should have this:
                      </label>                      
                        {/* <RoleMappingTag
                          value={td.users}
                          selectedRole={this.state.selectedRoleId}
                          whitelist={this.state.whitelistData}
                          userListCallback={detail =>
                            this.userListCallback(detail, td)
                          } /> */}
                           <ReactSelectAim
                                  async={true}                            
                                  label = {''}
                                  placeholder = {'Search user'}                                            
                                  optionLabel= {'value'}
                                  optionValueLabel= {'vzeid'}
                                  handleSelectChange={this.handleChartDropDownList}                    
                                  value={td.users}                                                          
                                  fetchOptions={this.fetchUsers}                      
                                  isMulti={true}
                                  additionalParams={{tdIndex} }
                              />
                      </div>
                    )
                ) : null}
              </div>
            ))}
          </div>
        );
      }
    }
  };

  validateAddRole = () => {
    if (this.state.domainName == '' || this.state.roleType == '' || this.state.location == '') {
      return true;
    } else if (this.state.domainName == "New Domain" && this.state.customDomainName == '') {
      return true;
    } else if (this.state.roleType == "New Role" && this.state.customRoleType == '') {
      return true;
    } else {
      return false;
    }
  }

  addRoleFun = () => {
    let payload = {
      appId: this.props.appId,
      locationId: parseInt(this.state.location),
      isControlled: this.state.isControlled ? "Y" : "N",
      createdBy: this.props.userId
    };
    if (this.state.domainName == "New Domain") {
      payload.roleNameID = "";
      payload.rlName = this.state.customDomainName;
    } else {
      const selectedDomain = this.props.roleDomainList.find(each => each.roleName == this.state.domainName);
      payload.roleNameID = selectedDomain.roleNameID;
      payload.rlName = selectedDomain.roleName;
    }
    if (this.state.roleType == "New Role") {
      payload.roleTypeID = "";
      payload.rlTypeName = this.state.customRoleType;
    } else {
      const selectedRole = this.props.roleNameList.find(each => each.roleTypeName == this.state.roleType);
      payload.roleTypeID = selectedRole.roleTypeID;
      payload.rlTypeName = selectedRole.roleTypeName;
    }
    this.props.setLoader(true);
    this.props.submitNewRole(payload);
  }

  validateAddMenu = () => {
    if (this.state.selectedMenuType == "MENU") {
      if (this.state.level == '' || this.state.menuName == '' || this.state.menuOrder == '' || this.state.menuUrl == '' || this.state.landingPage == '') {
        return true;
      }
      return false;
    } else {
      if (this.state.level == '') {
        return true;
      } else if (this.state.level == "same level" && (this.state.tabName == '' || this.state.selectedIcon == '')) {
        return true;
      } else if (this.state.level == "child level" && (this.state.level == '' || this.state.menuName == '' || this.state.menuOrder == '' || this.state.menuUrl == '' || this.state.landingPage == '')) {
        return true;
      } else {
        return false;
      }
    }
  }

  addMenuFun = () => {
    let payload = {
      menuOrder: "",
      menuName: "",
      menuURL: "",
      landingPage: "",
      parentId: "",
      tabName: "",
      tabIconURL: "",
      tabID: "",
      createdBy: this.props.userId,
      isOffshoreRestricted: false,
      appId: this.props.appId,
    };
    if (this.state.selectedMenuType == "TAB") {
      if (this.state.level == "same level") {
        payload.tabName = this.state.tabName;
        payload.tabIconURL = this.state.selectedIcon;
      } else {
        payload.menuOrder = this.state.menuOrder;
        payload.menuName = this.state.menuName;
        payload.menuURL = this.state.menuUrl;
        payload.landingPage = this.state.landingPage;
        payload.tabID = this.state.selectedMenuId;
        payload.isOffshoreRestricted = this.state.isOffshoreRestricted;

      }
      this.props.setLoader(true);
      this.props.submitNewTabMenu(this.state.level == "same level" ? "TAB" : "MENU", payload);
    } else {
      payload.menuOrder = this.state.menuOrder;
      payload.menuName = this.state.menuName;
      payload.menuURL = this.state.menuUrl;
      payload.landingPage = this.state.landingPage;
      payload.isOffshoreRestricted = this.state.isOffshoreRestricted;
      if (this.state.level == "same level") {
        if (this.state.selectedMenuNode.parentId == 0 || this.state.selectedMenuNode.parentId == undefined) {
          payload.tabID = this.state.selectedMenuNode.tabID;
        } else {
          payload.parentId = this.state.selectedMenuNode.parentId;
        }
      } else {
        payload.parentId = this.state.selectedMenuId;
      }
      this.props.setLoader(true);
      this.props.submitNewTabMenu(this.state.selectedMenuType, payload);
    }
  }

  editMenuFun = () => {
    let payload = {
      menuOrder: "",
      menuName: "",
      menuURL: "",
      landingPage: "",
      tabName: "",
      tabIconURL: "",
      tabID: "",
      menuID: "",
      updatedBy: this.props.userId,
      isOffshoreRestricted: false,
      appId: this.props.appId,
    };
    if (this.state.selectedMenuType == "TAB") {
      payload.tabName = this.state.tabName;
      payload.tabIconURL = this.state.selectedIcon;
      payload.tabID = this.state.selectedMenuId;
      this.props.setLoader(true);
      this.props.updateTabMenuDetails(this.state.selectedMenuType, payload);
    } else {
      payload.menuOrder = this.state.menuOrder;
      payload.menuName = this.state.menuName;
      payload.menuURL = this.state.menuUrl;
      payload.landingPage = this.state.landingPage;
      payload.menuID = this.state.selectedMenuId;
      payload.isOffshoreRestricted = this.state.isOffshoreRestricted;
      this.props.setLoader(true);
      this.props.updateTabMenuDetails(this.state.selectedMenuType, payload);
    }
  }

  handleRoleChange = event => {
    const name = event.target.name;
    const value = event.target.value;
    this.setState({
      [name]: value
    });
  }

  handleMenuChange = event => {
    const name = event.target.name;
    const value = event.target.value;
    this.setState({
      [name]: value,
    });
  }
  handleCheckChange = event => {
    this.setState({
      isOffshoreRestricted: event.target.checked == true ? 'Y' : 'N',
    });
  }

  selectIcon = (event) => {
    const iconName = event.target.id;
    this.setState({
      selectedIcon: iconName
    });
  }

  renderModalIcons = () => {
    return (
      <div style={{ marginLeft: "5px" }}>
        <img id="announcement.svg" className={["choose-icon-img", this.state.selectedIcon == "announcement.svg" ? "isActive" : null].join(" ")} src="javascript:void(0);" srcset={require("../img/announcement.svg")} onClick={this.selectIcon} />
        <img id="asset-tracking.svg" className={["choose-icon-img", this.state.selectedIcon == "asset-tracking.svg" ? "isActive" : null].join(" ")} src="javascript:void(0);" srcset={require("../img/asset-tracking.svg")} onClick={this.selectIcon} />
        <img id="calibrate.svg" className={["choose-icon-img", this.state.selectedIcon == "calibrate.svg" ? "isActive" : null].join(" ")} src="javascript:void(0);" srcset={require("../img/calibrate.svg")} onClick={this.selectIcon} />
        <img id="chat.svg" className={["choose-icon-img", this.state.selectedIcon == "chat.svg" ? "isActive" : null].join(" ")} src="javascript:void(0);" srcset={require("../img/chat.svg")} onClick={this.selectIcon} />
        <img id="document-cloud.svg" className={["choose-icon-img", this.state.selectedIcon == "document-cloud.svg" ? "isActive" : null].join(" ")} src="javascript:void(0);" srcset={require("../img/document-cloud.svg")} onClick={this.selectIcon} />
        <img id="document-compliance.svg" className={["choose-icon-img", this.state.selectedIcon == "document-compliance.svg" ? "isActive" : null].join(" ")} src="javascript:void(0);" srcset={require("../img/document-compliance.svg")} onClick={this.selectIcon} />
        <img id="connect.svg" className={["choose-icon-img", this.state.selectedIcon == "connect.svg" ? "isActive" : null].join(" ")} src="javascript:void(0);" srcset={require("../img/connect.svg")} onClick={this.selectIcon} />
        <img id="device-activity.svg" className={["choose-icon-img", this.state.selectedIcon == "device-activity.svg" ? "isActive" : null].join(" ")} src="javascript:void(0);" srcset={require("../img/device-activity.svg")} onClick={this.selectIcon} />
        <img id="display.svg" className={["choose-icon-img", this.state.selectedIcon == "display.svg" ? "isActive" : null].join(" ")} src="javascript:void(0);" srcset={require("../img/display.svg")} onClick={this.selectIcon} />
        <img id="flexibility-four-arrows.svg" className={["choose-icon-img", this.state.selectedIcon == "flexibility-four-arrows.svg" ? "isActive" : null].join(" ")} src="javascript:void(0);" srcset={require("../img/flexibility-four-arrows.svg")} onClick={this.selectIcon} />
        <img id="healthcare-corporate.svg" className={["choose-icon-img", this.state.selectedIcon == "healthcare-corporate.svg" ? "isActive" : null].join(" ")} src="javascript:void(0);" srcset={require("../img/healthcare-corporate.svg")} onClick={this.selectIcon} />
        <img id="industry.svg" className={["choose-icon-img", this.state.selectedIcon == "industry.svg" ? "isActive" : null].join(" ")} src="javascript:void(0);" srcset={require("../img/industry.svg")} onClick={this.selectIcon} />
        <img id="international.svg" className={["choose-icon-img", this.state.selectedIcon == "international.svg" ? "isActive" : null].join(" ")} src="javascript:void(0);" srcset={require("../img/international.svg")} onClick={this.selectIcon} />
        <img id="international-long-distance.svg" className={["choose-icon-img", this.state.selectedIcon == "international-long-distance.svg" ? "isActive" : null].join(" ")} src="javascript:void(0);" srcset={require("../img/international-long-distance.svg")} onClick={this.selectIcon} />
        <img id="iot.svg" className={["choose-icon-img", this.state.selectedIcon == "iot.svg" ? "isActive" : null].join(" ")} src="javascript:void(0);" srcset={require("../img/iot.svg")} onClick={this.selectIcon} />
        <img id="join-call.svg" className={["choose-icon-img", this.state.selectedIcon == "join-call.svg" ? "isActive" : null].join(" ")} src="javascript:void(0);" srcset={require("../img/join-call.svg")} onClick={this.selectIcon} />
        <img id="documents.svg" className={["choose-icon-img", this.state.selectedIcon == "documents.svg" ? "isActive" : null].join(" ")} src="javascript:void(0);" srcset={require("../img/documents.svg")} onClick={this.selectIcon} />
        <img id="laptop-wireless.svg" className={["choose-icon-img", this.state.selectedIcon == "laptop-wireless.svg" ? "isActive" : null].join(" ")} src="javascript:void(0);" srcset={require("../img/laptop-wireless.svg")} onClick={this.selectIcon} />
        <img id="location.svg" className={["choose-icon-img", this.state.selectedIcon == "location.svg" ? "isActive" : null].join(" ")} src="javascript:void(0);" srcset={require("../img/location.svg")} onClick={this.selectIcon} />
        <img id="mobile-hotspot.svg" className={["choose-icon-img", this.state.selectedIcon == "mobile-hotspot.svg" ? "isActive" : null].join(" ")} src="javascript:void(0);" srcset={require("../img/mobile-hotspot.svg")} onClick={this.selectIcon} />
        <img id="mobile-retail.svg" className={["choose-icon-img", this.state.selectedIcon == "mobile-retail.svg" ? "isActive" : null].join(" ")} src="javascript:void(0);" srcset={require("../img/mobile-retail.svg")} onClick={this.selectIcon} />
        <img id="mobile-search.svg" className={["choose-icon-img", this.state.selectedIcon == "mobile-search.svg" ? "isActive" : null].join(" ")} src="javascript:void(0);" srcset={require("../img/mobile-search.svg")} onClick={this.selectIcon} />
        <img id="nation-wide.svg" className={["choose-icon-img", this.state.selectedIcon == "nation-wide.svg" ? "isActive" : null].join(" ")} src="javascript:void(0);" srcset={require("../img/nation-wide.svg")} onClick={this.selectIcon} />
        <img id="pharmaceutical.svg" className={["choose-icon-img", this.state.selectedIcon == "pharmaceutical.svg" ? "isActive" : null].join(" ")} src="javascript:void(0);" srcset={require("../img/pharmaceutical.svg")} onClick={this.selectIcon} />
        <img id="professional-services-case.svg" className={["choose-icon-img", this.state.selectedIcon == "professional-services-case.svg" ? "isActive" : null].join(" ")} src="javascript:void(0);" srcset={require("../img/professional-services-case.svg")} onClick={this.selectIcon} />
        <img id="professional-services-chart.svg" className={["choose-icon-img", this.state.selectedIcon == "professional-services-chart.svg" ? "isActive" : null].join(" ")} src="javascript:void(0);" srcset={require("../img/professional-services-chart.svg")} onClick={this.selectIcon} />
        <img id="customize-blk.svg" className={["choose-icon-img", this.state.selectedIcon == "customize-blk.svg" ? "isActive" : null].join(" ")} src="javascript:void(0);" srcset={require("../img/customize-blk.svg")} onClick={this.selectIcon} />
        <img id="feedback.svg" className={["choose-icon-img", this.state.selectedIcon == "feedback.svg" ? "isActive" : null].join(" ")} src="javascript:void(0);" srcset={require("../img/feedback.svg")} onClick={this.selectIcon} />
        <img id="audience-targeted-search-wh.svg" className={["choose-icon-img", this.state.selectedIcon == "audience-targeted-search-wh.svg" ? "isActive" : null].join(" ")} src="javascript:void(0);" srcset={require("../img/audience-targeted-search-wh.svg")} onClick={this.selectIcon} />
        <img id="cell-tower.svg" className={["choose-icon-img", this.state.selectedIcon == "cell-tower.svg" ? "isActive" : null].join(" ")} src="javascript:void(0);" srcset={require("../img/cell-tower.svg")} onClick={this.selectIcon} />
        <img id="cross-device-targeting-wh.svg" className={["choose-icon-img", this.state.selectedIcon == "cross-device-targeting-wh.svg" ? "isActive" : null].join(" ")} src="javascript:void(0);" srcset={require("../img/cross-device-targeting-wh.svg")} onClick={this.selectIcon} />
        <img id="enterprise.svg" className={["choose-icon-img", this.state.selectedIcon == "enterprise.svg" ? "isActive" : null].join(" ")} src="javascript:void(0);" srcset={require("../img/enterprise.svg")} onClick={this.selectIcon} />
        <img id="expense-wh.svg" className={["choose-icon-img", this.state.selectedIcon == "expense-wh.svg" ? "isActive" : null].join(" ")} src="javascript:void(0);" srcset={require("../img/expense-wh.svg")} onClick={this.selectIcon} />
        <img id="government.svg" className={["choose-icon-img", this.state.selectedIcon == "government.svg" ? "isActive" : null].join(" ")} src="javascript:void(0);" srcset={require("../img/government.svg")} onClick={this.selectIcon} />
        <img id="medium-business.svg" className={["choose-icon-img", this.state.selectedIcon == "medium-business.svg" ? "isActive" : null].join(" ")} src="javascript:void(0);" srcset={require("../img/medium-business.svg")} onClick={this.selectIcon} />
        <img id="mobile-plus-TV-blk.svg" className={["choose-icon-img", this.state.selectedIcon == "mobile-plus-TV-blk.svg" ? "isActive" : null].join(" ")} src="javascript:void(0);" srcset={require("../img/mobile-plus-TV-blk.svg")} onClick={this.selectIcon} />
        <img id="network.svg" className={["choose-icon-img", this.state.selectedIcon == "network.svg" ? "isActive" : null].join(" ")} src="javascript:void(0);" srcset={require("../img/network.svg")} onClick={this.selectIcon} />
        <img id="operational-transformation.svg" className={["choose-icon-img", this.state.selectedIcon == "operational-transformation.svg" ? "isActive" : null].join(" ")} src="javascript:void(0);" srcset={require("../img/operational-transformation.svg")} onClick={this.selectIcon} />
        <img id="orders.svg" className={["choose-icon-img", this.state.selectedIcon == "orders.svg" ? "isActive" : null].join(" ")} src="javascript:void(0);" srcset={require("../img/orders.svg")} onClick={this.selectIcon} />
        <img id="platform-blk.svg" className={["choose-icon-img", this.state.selectedIcon == "platform-blk.svg" ? "isActive" : null].join(" ")} src="javascript:void(0);" srcset={require("../img/platform-blk.svg")} onClick={this.selectIcon} />
        <img id="re-targeting-wh.svg" className={["choose-icon-img", this.state.selectedIcon == "re-targeting-wh.svg" ? "isActive" : null].join(" ")} src="javascript:void(0);" srcset={require("../img/re-targeting-wh.svg")} onClick={this.selectIcon} />
        <img id="real-time-blk.svg" className={["choose-icon-img", this.state.selectedIcon == "real-time-blk.svg" ? "isActive" : null].join(" ")} src="javascript:void(0);" srcset={require("../img/real-time-blk.svg")} onClick={this.selectIcon} />
        <img id="server-stack.svg" className={["choose-icon-img", this.state.selectedIcon == "server-stack.svg" ? "isActive" : null].join(" ")} src="javascript:void(0);" srcset={require("../img/server-stack.svg")} onClick={this.selectIcon} />
        <img id="shopping.svg" className={["choose-icon-img", this.state.selectedIcon == "shopping.svg" ? "isActive" : null].join(" ")} src="javascript:void(0);" srcset={require("../img/shopping.svg")} onClick={this.selectIcon} />
        <img id="survey-wh.svg" className={["choose-icon-img", this.state.selectedIcon == "survey-wh.svg" ? "isActive" : null].join(" ")} src="javascript:void(0);" srcset={require("../img/survey-wh.svg")} onClick={this.selectIcon} />
        <img id="tablet-data.svg" className={["choose-icon-img", this.state.selectedIcon == "tablet-data.svg" ? "isActive" : null].join(" ")} src="javascript:void(0);" srcset={require("../img/tablet-data.svg")} onClick={this.selectIcon} />
        <img id="technology.svg" className={["choose-icon-img", this.state.selectedIcon == "technology.svg" ? "isActive" : null].join(" ")} src="javascript:void(0);" srcset={require("../img/technology.svg")} onClick={this.selectIcon} />
        <img id="ticket.svg" className={["choose-icon-img", this.state.selectedIcon == "ticket.svg" ? "isActive" : null].join(" ")} src="javascript:void(0);" srcset={require("../img/ticket.svg")} onClick={this.selectIcon} />
        <img id="visibility-blk.svg" className={["choose-icon-img", this.state.selectedIcon == "visibility-blk.svg" ? "isActive" : null].join(" ")} src="javascript:void(0);" srcset={require("../img/visibility-blk.svg")} onClick={this.selectIcon} />
        <img id="yield-wh.svg" className={["choose-icon-img", this.state.selectedIcon == "yield-wh.svg" ? "isActive" : null].join(" ")} src="javascript:void(0);" srcset={require("../img/yield-wh.svg")} onClick={this.selectIcon} />
      </div>
    )
  }

  renderEditMenuContent = () => {
    return (
      <div style={{ textAlign: "center" }}>
        {this.props.loader ? <Loader /> : null}
        {this.props.roleApiSuccess === true && (
          <Alert variant="success" onClose={this.closeModalFun} dismissible>
            {/* {this.state.selectedMenuType == "MENU" ? "Menu Updated Successfully." : "Tab Updated Successfully"} */}
            {this.props.roleApiMsg}
          </Alert>
        )}
        {this.props.roleApiError === true && (
          <Alert variant="danger" onClose={this.closeModalFun} dismissible>
            {this.props.roleApiMsg}
          </Alert>
        )}
        <div className="role-modal-content">
          {this.state.selectedMenuType == "TAB" &&
            <>
              <div>
                <label className="role-label">Enter New Tab Name<span className="db-asterisk">*</span></label>
                <input name="tabName" type="text" className="role-select" value={this.state.tabName} onChange={event => this.handleMenuChange(event)} />
              </div>
              <div style={{ padding: "0 60px" }}>
                <label className="" style={{ marginBottom: "10px", marginTop: "15px", marginLeft: "-480px" }}>Select Icon<span className="db-asterisk">*</span></label>
                {this.renderModalIcons()}
              </div>
            </>}
          {this.state.selectedMenuType == "MENU" &&
            <>
              <div>
                <label className="role-label">Enter New Menu Name<span className="db-asterisk">*</span></label>
                <input name="menuName" type="text" className="role-select" value={this.state.menuName} onChange={event => this.handleMenuChange(event)} />
              </div>
              <div>
                <label className="role-label">Enter New Menu Order<span className="db-asterisk">*</span></label>
                <input name="menuOrder" type="text" className="role-select" value={this.state.menuOrder} onChange={event => this.handleMenuChange(event)} />
              </div>
              {this.state.menuUrl !== undefined &&
                <div>
                  <label className="role-label">Enter New Menu URL<span className="db-asterisk">*</span></label>
                  <input name="menuUrl" type="text" className="role-select" value={this.state.menuUrl} onChange={event => this.handleMenuChange(event)} />
                </div>
              }
              {this.state.landingPage !== undefined &&
                <div>
                  <label className="role-label">Select New Landing Page<span className="db-asterisk">*</span></label>
                  <select name="landingPage" className="role-select" value={this.state.landingPage} onChange={event => this.handleMenuChange(event)}>
                    <option value="" disabled selected>Select landing page</option>
                    {this.props.landingPageValues.map(el => {
                      return <option key={el} value={el}>{el}</option>
                    })}
                  </select>
                </div>
              }
              <div>
                <label className="role-label">Is Offshore Restricted</label>
                <input checked={this.state.isOffshoreRestricted == 'Y' ? true : false} value={this.state.isOffshoreRestricted} type="checkbox" className="role-select-check" onChange={event => this.handleCheckChange(event)} />
              </div>
            </>}
        </div>
        <div className="role-modal-footer">
          <button className="role-button" onClick={this.closeModalFun}>Cancel</button>
          <button className="role-button" onClick={this.editMenuFun}>Update</button>
        </div>
      </div>
    )
  }

  renderAddMenuContent = () => {
    return (
      <div style={{ textAlign: "center" }}>
        {this.props.loader ? <Loader /> : null}
        {this.props.roleApiSuccess === true &&
          <Alert variant="success" onClose={this.closeModalFun} dismissible>
            {/* {this.state.selectedMenuType == "MENU" ? "Menu Created Successfully." : "Tab Created Successfully"} */}
            {this.props.roleApiMsg}
          </Alert>
        }
        {this.props.roleApiError === true && (
          <Alert variant="danger" onClose={this.closeModalFun} dismissible>
            {this.props.roleApiMsg}
          </Alert>
        )}
        <div className="role-modal-content">
          <div>
            <label className="role-label">Select Level<span className="db-asterisk">*</span></label>
            <select name="level" className="role-select" value={this.state.level} onChange={event => this.handleRoleChange(event)}>
              <option value="" disabled selected>Select Level</option>
              <option value="same level">Same Level</option>
              <option value="child level">Child Level</option>
            </select>
          </div>
          {(this.state.selectedMenuType == "MENU" || (this.state.selectedMenuType == "TAB" && this.state.level == "child level")) &&
            <>
              <div>
                <label className="role-label">Enter Menu Name<span className="db-asterisk">*</span></label>
                <input name="menuName" type="text" className="role-select" onChange={event => this.handleMenuChange(event)} />
              </div>
              <div>
                <label className="role-label">Enter Menu Order<span className="db-asterisk">*</span></label>
                <input name="menuOrder" type="text" className="role-select" onChange={event => this.handleMenuChange(event)} />
              </div>
              <div>
                <label className="role-label">Enter Menu URL<span className="db-asterisk">*</span></label>
                <input name="menuUrl" type="text" className="role-select" onChange={event => this.handleMenuChange(event)} />
              </div>
              <div>
                <label className="role-label">Select Landing Page<span className="db-asterisk">*</span></label>
                <select name="landingPage" className="role-select" onChange={event => this.handleMenuChange(event)}>
                  <option value="" disabled selected>Select landing page</option>
                  {this.props.landingPageValues.map(el => {
                    return <option key={el} value={el}>{el}</option>
                  })}
                </select>
              </div>
              <div>
                <label className="role-label">Is Offshore Restricted</label>
                <input checked={this.state.isOffshoreRestricted == 'Y' ? true : false} type="checkbox" className="role-select-check" onChange={event => this.handleCheckChange(event)} />
              </div>
            </>
          }
          {this.state.selectedMenuType == "TAB" && this.state.level !== "child level" &&
            <>
              <div>
                <label className="role-label">Enter Tab Name<span className="db-asterisk">*</span></label>
                <input name="tabName" type="text" className="role-select" onChange={event => this.handleMenuChange(event)} />
              </div>
              <div style={{ padding: "0 60px" }}>
                <label className="" style={{ marginBottom: "10px", marginTop: "15px", marginLeft: "-480px" }}>Select Icon<span className="db-asterisk">*</span></label>
                {this.renderModalIcons()}
              </div>
            </>
          }
        </div>
        <div className="role-modal-footer">
          <button className="role-button" onClick={this.closeModalFun}>Cancel</button>
          <button className="role-button" disabled={this.validateAddMenu()} onClick={this.addMenuFun}>Add Menu</button>
        </div>
      </div>
    )
  }

  renderAddRoleContent = () => {
    return (
      <div style={{ textAlign: "center" }}>
        {this.props.loader ? <Loader /> : null}
        {true && (
          <Alert variant="success" onClose={this.closeModalFun} dismissible>
            {this.props.roleApiMsg}
          </Alert>
        )}
        {this.props.roleApiError === true && (
          <Alert variant="danger" onClose={this.closeModalFun} dismissible>
            {this.props.roleApiMsg}
          </Alert>
        )}
        <div className="role-modal-content">
          <div>
            <label className="role-label">Select Domain<span className="db-asterisk">*</span></label>
            <select name="domainName" className="role-select" onChange={event => this.handleRoleChange(event)}>
              <option value="" disabled selected>Select Domain Name</option>
              {this.props.roleDomainList.map(el => {
                return <option key={el.roleNameID} value={el.roleName}>{el.roleName}</option>
              })}
              <option value="New Domain">New Domain</option>
            </select>
          </div>
          {this.state.domainName == "New Domain" &&
            <div>
              <label className="role-label">Enter Domain Name<span className="db-asterisk">*</span></label>
              <input name="customDomainName" type="text" className="role-select" onChange={event => this.handleRoleChange(event)} />
            </div>
          }
          <div>
            <label className="role-label">Select Role<span className="db-asterisk">*</span></label>
            <select name="roleType" className="role-select" value={this.state.roleType} onChange={event => this.handleRoleChange(event)}>
              <option value="" disabled selected>Select Role Name</option>
              {this.props.roleNameList.map(el => {
                return <option key={el.roleTypeID} value={el.roleTypeName}>{el.roleTypeName}</option>
              })}
              <option value="New Role">New Role</option>
            </select>
          </div>
          {this.state.roleType == "New Role" &&
            <div>
              <label className="role-label">Enter Role Name<span className="db-asterisk">*</span></label>
              <input name="customRoleType" type="text" className="role-select" onChange={event => this.handleRoleChange(event)} />
            </div>
          }
          <div>
            <label className="role-label">Location<span className="db-asterisk">*</span></label>
            <select name="location" className="role-select" value={this.state.location} onChange={event => this.handleRoleChange(event)}>
              <option value="" disabled selected>Select Location</option>
              <option value={1}>onShore</option>
              <option value={2}>offShore</option>
            </select>
          </div>
          <div>
            <input className="role-modal-checkBox" type="checkbox" value={this.state.isControlled} onChange={event => { this.setState({ isControlled: event.target.checked }) }} />
            <label style={{ position: "relative", top: "1px" }}>IsControlled</label>
          </div>
        </div>
        <div className="role-modal-footer">
          <button className="role-button" onClick={this.closeModalFun}>Cancel</button>
          <button className="role-button" disabled={this.validateAddRole()} onClick={this.addRoleFun}>Add Role</button>
        </div>
      </div>
    )
  }

  resetState = () => {
    // if(!this.state.roleType){
    //   this.setState({submitSuccess: false})
    // } else {
    //   this.setState({
    //     disableSubmit: false,
    //     submitSuccess: false,
    //     treeData: defaultTreeData
    //   });      
    // } 
    this.setState({
      disableSubmit: false,
      submitSuccess: false,
      treeData: defaultTreeData,
      rowsSelected: []
    });
  };

  openModalFun = (title, type) => {
    let menuName = '';
    let menuOrder = '';
    let menuUrl = '';
    let landingPage = '';
    let tabName = '';
    let selectedIcon = '';
    let isOffshoreRestricted = '';
    if (type == "EDIT_MENU") {
      if (this.state.selectedMenuType == "MENU") {
        menuName = this.state.selectedMenuNode.menuName;
        menuOrder = this.state.selectedMenuNode.menuOrder;
        menuUrl = this.state.selectedMenuNode.menuUrl;
        landingPage = this.state.selectedMenuNode.landingPage;
        isOffshoreRestricted = this.state.selectedMenuNode.isOffshoreRestricted
      } else {
        tabName = this.state.selectedMenuNode.tabName;
        selectedIcon = this.state.selectedMenuNode.iconUrl;
      }
    }
    this.setState({
      openModal: true,
      modalTitle: title,
      modalAction: type,
      menuName,
      menuOrder,
      menuUrl,
      landingPage,
      tabName,
      selectedIcon,
      isOffshoreRestricted,
    });
  }

  closeModalFun = () => {
    this.setState({
      openModal: false,
      modalTitle: '',
      modalAction: '',
      domainName: '',
      roleType: '',
      location: '',
      isControlled: '',
      customDomainName: '',
      customRoleType: '',
      level: '',
      menuName: '',
      tabName: '',
      menuOrder: undefined,
      menuUrl: '',
      landingPage: '',
      selectedIcon: '',
      isOffshoreRestricted: '',
      userEID: null,
      selectedUsersList: [],
      openConfirmationModal: false,
      showMsg: false,
      alertMsg: '',
      rowsSelected: []
    });
    if (this.props.roleApiError || this.props.roleApiSuccess) {
      this.props.clearRoleMsg();
    }
    if (this.props.deactivateApiError || this.props.deactivateApiSuccess) {
      this.props.clearDeactivateMsg();
    }
    //this.props.getRolePrivileges(this.props.currentRoleId);
  }

  render() {
    const { privilege } = this.state;
    let usersListTable = null;
    if (this.state.showusers)
      usersListTable = this.renderusersListTable();

    return (
      <div>
        {Object.keys(this.props.roleMenus).length === 0 || this.state.showSpinner ? (
          <div>
            <Loader />{" "}
          </div>
        ) : (
            <div className="tab_margin">
              {this.state.submitSuccess === true && (
                <Alert variant="success" onClose={this.resetState} dismissible>
                  Successfully saved.
                </Alert>
              )}

              <h4 className="page-h4">Role Menu Mapping</h4>
              <hr className="section-hr" />
              <br />

              {this.props.deactivateApiSuccess === true && (
                <Alert variant="success" onClose={this.closeModalFun} dismissible>
                  {this.props.deactivateApiMsg}
                </Alert>
              )}
              {this.props.deactivateApiError === true && (
                <Alert variant="danger" onClose={this.closeModalFun} dismissible>
                  {this.props.deactivateApiMsg}
                </Alert>
              )}

              <Grid>
                <Row>
                  <Col span={3}>
                    <div className="Form-group publish-insights-input">
                      <label className="Form-label label_padding">
                        Role Name <span style={{ color: "red" }}>*</span>
                      </label>
                      <select required
                        id="requestStatus"
                        role="combobox"
                        className="Form-input"
                        name="requestStatus"
                        value={this.state.roleSelected}
                        onChange={e => this.onSelectRole(e)}>
                        <option value="" disabled>
                          Select Role{" "}
                        </option>
                        {this.props.listOfRoles
                          ? this.props.listOfRoles[0].roles.map((role, index) => {
                            return (
                              <option
                                value={role.rlName}
                                key={`${role.rlName}-${index}`}
                              >
                                {role.rlName}
                              </option>
                            );
                          })
                          : null}
                      </select>
                    </div>
                  </Col>

                  <Col span={1}>
                    <div style={{ display: "inline-block" }}>
                      <img className="role-db-icon" src={profile} onClick={() => this.openModalFun('Add Role', 'ADD_ROLE')} />
                    </div>
                  </Col>

                  <Col span={8}>
                    <div style={{ float: "right" }}>
                      <button
                        onClick={this.submitClicked}
                        style={{ marginTop: "1rem" }} >
                        Submit
                      </button>
                    </div>
                  </Col>
                </Row>
                <Row>
                  <Col span={4}>{this.showAllMenus()}</Col>
                  {!this.state.initialLoad &&
                    <Col span={7} style={{ marginLeft: "3rem" }}>
                      <div style={{ border: "1px solid #c8c8c8", minHeight: "300px", maxHeight: "300px" }}>
                        <div style={{ borderBottom: "1px solid rgb(216, 218, 218)" }}>
                          <h4 style={{ marginTop: "5px", marginLeft: "8px", fontWeight: "bold" }}>Assign Privileges:</h4>
                        </div>
                        <div style={{ 'maxHeight': '255px', 'overflowY': 'auto' }}>
                          {!this.props.roleMappingMenus.fetching ?
                            <div className="sel-all-checkbox" style={{ padding: '10px 10px 0', position: 'relative', top: '8px' }}>
                              <MenuCheckbox
                                name={'Select All'}
                                value={'SA'}
                                checked={this.state.isroleSA === 'SA'}
                                changed={() => this.parentClicked(this.state.isroleSA === 'SA' ? 'DSA' : "SA", null)}
                              />
                            </div> : null}
                          {this.showAllPrivileges()}
                        </div>
                      </div>
                    </Col>
                  }
                </Row>
              </Grid>
              {this.state.openModal &&
                <Modal showClose={true} show={this.state.openModal} handleClose={this.closeModalFun} modalTitle={this.state.modalTitle} >
                  {this.state.modalAction == "ADD_ROLE" ? this.renderAddRoleContent() : this.state.modalAction == "ADD_MENU" ? this.renderAddMenuContent() : this.renderEditMenuContent()}
                </Modal>
              }
            </div>
          )}
        {this.state.showusers ?
          <div>

            <Grid>
              <Row>
                <Col span={8}>
                  <h3 className="page-h4" style={{ margin: "1.5rem 0 0 2.2rem" }}>User's List</h3>
                </Col>
                <Col span={4}>
                  <div style={{ float: "right" }}>
                    <button
                      onClick={this.fnDeactivate}
                      style={{ marginTop: "1rem" }}  >
                      Deactivate
                      </button>
                  </div>
                </Col>
              </Row>
            </Grid>
            <hr className="section-hr" style={{ marginLeft: "2.2rem" }} />
            {usersListTable}</div> : null}
        <Modal showClose={true} show={this.state.showMsg} handleClose={this.closeModalFun} modalTitle='Alert' style={{ width: "20%" }}
          height="20%" >
          <div className="modal-container" style={{ 'padding': '1% 1% 1% 3%' }}><h2>{this.state.alertMsg}</h2></div>
        </Modal>

        <Modal show={this.state.openConfirmationModal} customClass={"pf-override-modal modal-main"} style={{ 'width': '40%' }}
          height="30%" modalTitle={"Confirmation"} disableClose={true}>
          <div className="modal-container" style={{ 'padding': '1% 1% 1% 3%' }}>
            <h4 className="pf-override-title">Do you like to
            {this.state.isDeactivate ? ' Deactivate User ' : ' Remove role for '} '{this.state.selectedName}'?</h4>
            <div>
              <button style={{ color: "white", backgroundColor: "black", float: "right", marginTop: "2rem" }}
                onClick={() => this.skipDeactivate()}>No</button>
              <button style={{ color: "white", backgroundColor: "black", float: "right", marginTop: "2rem" }}
                onClick={() => this.deactivateUser()}>Yes</button>
            </div>
          </div>
        </Modal>
      </div>
    );
  }

  renderusersListTable() {

    // BUILD JSON DATA FOR TABLE
    const columnsAvailable = [
      {
        name: "vzeid",
        label: "VZEID",
        type: 'string',
        options: {
          filter: false,
          display: false,
          searchable: true,
          filterType: 'textField'
        }
      },
      //  {
      //   name: "firstName",
      //   label: "Name",
      //   type: 'searchName',
      //   options: {
      //     filter: true,
      //     sort: true,
      //     sortDirection: true,
      //     filterOptions: true,
      //     filterType: 'custom',
      //     customBodyRender: (value, tableMeta, updateValue) => {
      //       return tableMeta.rowData[1] + " " + tableMeta.rowData[2];
      //     }
      //   }
      // },
      {
        name: "firstName",
        label: "Name",
        type: 'reactSelect',
        reactSelectConfig : {
            fetchApi : this.fetchUsersForTable,
            async : true,
            placeholder:'Name',
            isMulti : true,                    
            muiLabel : true,
        },
        options: {
            filter: true,
            sort: true,
            filterType: 'custom',
            sortDirection : true, 
            customBodyRender: (value, tableMeta, updateValue) => {
              return tableMeta.rowData[1] + " " + tableMeta.rowData[2];
            }     
        }
      },
      {
        name: "lastName",
        label: "LAST_NAME",
        type: 'string',
        options: {
          filter: false,
          display: false
        }
      },
      {
        name: "emailAddress",
        label: "Email Address",
        type: 'string',
        options: {
          display: true,
          filter: true,
          sort: false,
          filterType: 'textField'
        }
      },
      {
        name: "supervisorName",
        label: "SUPERVISOR_NAME",
        type: 'string',
        options: {
          filter: true,
          sort: true,
          sortDirection: true,
          filterOptions: true,
          filterType: 'textField',
        }
      },
      {
        name: "Action",
        options: {
          filter: false,
          sort: false,
          empty: true,
          display: true,
          customBodyRender: (value, tableMeta, updateValue) => {
            return (
              <div className="table-action-icons-wrap">
                <img className="icon-class" id="imgDeactivate" title="Remove Role Mapped with User"
                  onClick={() => [
                    this.setState({ userEID: tableMeta.rowData[0], openConfirmationModal: true, isDeactivate: false, selectedName: tableMeta.rowData[1] + ' ' + tableMeta.rowData[2] }),
                  ]}
                  src={require("../img/icons/exclude_user.svg")}
                  alt="Remove Role Mapped with User" />
              </div>
            );
          }
        }
      }

    ]

    // COLUMN DATA FOR TABLE
    let columnName = [];


    if (this.props.columnSortDirection.length == 0) {
      // GENERATE TABLE CONFIG DATA TO STORE IN REDUX FOR THE FIRST TIME    
      let columnData = [];
      let columnSortDirection = [];
      let filtersSelectedValues = [];
      let filtersValues = [];


      for (let i = 0; i < columnsAvailable.length; i++) {
        columnSortDirection.push("none");
        if (columnsAvailable[i].defaultValue) {
          if (columnsAvailable[i].type === 'searchName') {
            filtersSelectedValues.push(JSON.stringify([columnsAvailable[i].defaultValue]));
            filtersValues.push(JSON.stringify([columnsAvailable[i].defaultValue]));
          } else {
            filtersSelectedValues.push([columnsAvailable[i].defaultValue]);
            filtersValues.push([columnsAvailable[i].defaultValue]);
          }
        } else {
          filtersSelectedValues.push([]);
          filtersValues.push([]);
        }

        // To sort dynamically have to store names in an array and it used for filter. 
        columnData.push({ name: columnsAvailable[i].name, type: columnsAvailable[i].type, label: columnsAvailable[i].label });
      }

      this.props.muiTableStoreFilterInit(columnSortDirection, filtersSelectedValues, filtersValues);
      this.props.muiTableStoreColumnData(columnData);
    }


    // LOAD THE TABLE AFTER GETTING DATA IN REDUX
    if (this.props.columnSortDirection.length > 1) {
      // LOOP THE COLUMN DATA AND GENERATE COLUMNS 
      columnName = columnsGenerator(columnsAvailable, this.props)
    }


    // MUI DATATABLE - CONFIG  
    const options = {
      filterType: 'dropDown',
      searchText: this.props.searchText,
      searchPlaceholder: 'Search',
      print: false,
      download: false,
      search: true,
      pagination: true,
      filter: true,
      selectableRows: true,
      serverSide: true,
      viewColumns: false,
      page: this.props.tableCurrentPage,
      count: this.props.tableTotalCount,
      responsive: 'scrollMaxHeight',
      fixedHeaderOptions: {
        xAxis: false,
        yAxis: true
      },
      disableToolbarSelect: true,
      isRowSelectable: (dataIndex, selectedRows, data) => {
        return true;
      },
      rowsSelected: this.state.rowsSelected,
      onRowsSelect: (rowData, rowState, rowsSelected) => {
        var selectedUsers = [];
        var selectedUsersName = [];
        for (var a = 0; a < rowState.length; a++) {
          selectedUsers.push(this.props.tableData[rowState[a]["dataIndex"]].vzeid);
          selectedUsersName.push(this.props.tableData[rowState[a]["dataIndex"]].firstName + ' ' + this.props.tableData[rowState[a]["dataIndex"]].lastName);
        }
        this.setState({ selectedUsersList: selectedUsers, showDeactivate: true, selectedName: selectedUsersName.join(','), rowsSelected: rowsSelected })
      },
      onColumnSortChange: (changedColumn) => {
        let sortDirection = 'asc'
        if (this.props.columnNameLastSorted != changedColumn && this.props.columnLastSortedType == '') {
          sortDirection = 'asc'
        }
        else if (this.props.columnNameLastSorted == changedColumn) {
          this.props.columnLastSortedType == 'asc' ? sortDirection = 'desc' : sortDirection = 'asc';
        } else {
          sortDirection = 'asc'
        }
        this.sortTable(this.props.tableCurrentPage, this.props.tableRowsPerPage, changedColumn, sortDirection);
      },
      onFilterChange: (changedColumn, filterList, type) => {
        if (type == "reset") {
          this.resetTableFilter();
        }
      },
      onTableChange: (action, tableState) => {
        if (tableState) {
          if (action == 'changePage' || 'changeRowsPerPage') {
            this.updateTable(tableState, action);
          }
        }
      },
      customFilterDialogFooter: filterList => {
        return (
          <div style={{ marginTop: '40px' }}>
            <button className="sq-csql-button" variant="contained" onClick={this.handleFilterSubmit(filterList)}>Apply Filters</button>
          </div>
        );
      },
      onSearchChange: (searchText) => {
        this.tableGlobalSearch(searchText);
      },
      onSearchClose: () => {
        this.setState({ rowsSelected: [] });
      }
    };

    let theme = createMuiTheme({
      overrides: {
        MUIDataTable: {
          responsiveScroll: {
            height: '40vh'
          }
        },
      }
    });

    return (
      <div className="manage-message-code-table-wrapper mui-table-wrapper">
        {this.props.loader && <Loader tableLoader={true} />}
        <MUIDataTable
          data={this.props.tableData && this.props.tableData.length > 0 ? this.props.tableData : []}
          columns={columnName}
          options={options}
          components={{ TableFilterList: (props) => <span></span>}}
        />
      </div>
    )
  }

  updateTable = (tableState, action) => {
    const { page, rowsPerPage } = tableState;

    let offset = 0;
    if (page > 0) {
      offset = (page) * rowsPerPage;
    }
    let limit = rowsPerPage;

    switch (action) {
      case 'changePage':
        this.props.getUsersListMappedWithRole(this.state.selectedRoleID, this.props.appId, offset, limit, this.props.searchText, this.props.lastSentFilters, this.props.columnNameLastSorted, this.props.columnLastSortedType);
        this.props.muiTableUpdatePage(page, rowsPerPage)
        break;
      case 'changeRowsPerPage':
        this.props.getUsersListMappedWithRole(this.state.selectedRoleID, this.props.appId, offset, limit, this.props.searchText, this.props.lastSentFilters, this.props.columnNameLastSorted, this.props.columnLastSortedType);
        this.props.muiTableUpdatePage(page, rowsPerPage)
        break;
    }
  }

  resetTableFilter = () => {
    let columnSortDirection = [];
    let filtersSelectedValues = [];
    let filtersValues = this.props.filtersValues;
    for (let i = 0; i < this.props.columnData.length; i++) {
      columnSortDirection.push("none");
      filtersSelectedValues.push([]);
    }
    let conditionVal = getColumnIndexHelper('condition', this.props.columnData);
    filtersValues[conditionVal] = [true];
    filtersSelectedValues[conditionVal] = [true];
    this.props.muiTableStoreFilterInit(columnSortDirection, filtersSelectedValues, filtersValues);

  }

  tableGlobalSearch = (searchText) => {
    let searchVal = searchText == null ? '' : searchText;
    if (searchText == null) {
      this.props.muiTableClearSearch();
    }
    let filtersData = filterSubmitHelper(this.props.filtersSelectedValues, this.props);
    this.props.getUsersListMappedWithRole(this.state.selectedRoleID, this.props.appId, 0, 10, searchVal, filtersData, '', '');
  }

  handleFilterSubmit = filterList => () => {
    // BUILD JSON FOR API
    let filtersData = filterSubmitHelper(filterList, this.props);

    // UPDATE THE FILTERLIST IN REDUCER
    this.props.muiTableUpdateFilter(filterList, filtersData);

    // CALL THE APi
    this.props.getUsersListMappedWithRole(this.state.selectedRoleID, this.props.appId, 0, 10, '', filtersData, '', '');

    // CLOSE THE FILTERS MODAL AFTER SUBMITING 
    if (document.querySelector(".MuiPopover-root div")) {
      document.querySelector(".MuiPopover-root div").click();
    }
  };

  skipDeactivate() {
    this.setState({ selectedUsersList: [], userEID: null, openConfirmationModal: false, isDeactivate: false, rowsSelected: [] });
  }

  deactivateUser = () => {
    let appId = this.props.appId,
      userEIDs = this.state.selectedUsersList.length > 0 ? this.state.selectedUsersList.join(",") : this.state.userEID,
      createdBy = this.props.userId;
    this.props.setLoader(true);
    if (this.state.isDeactivate)
      this.props.fndeactivateUser(userEIDs, appId, createdBy);
    else
      this.props.fnremoveRoleMappedWithUser(userEIDs, this.state.selectedRoleID);
    this.setState({ selectedUsersList: [], userEID: null, openConfirmationModal: false, isDeactivate: false, rowsSelected: [] });
    this.props.getUsersListMappedWithRole(this.state.selectedRoleID, this.props.appId);
  }

}

const mapStateToProps = state => ({
  appId: state.LoginReducer.appId,
  userId: state.LoginReducer.loginInfo.userDTO.vzeid,
  listOfRoles: state.LoginReducer.listOfRoles,
  roleMenus: state.RoleMappingReducer.menus,
  menuNames: state.RoleMappingReducer.menuNames,
  menuIds: state.RoleMappingReducer.menuIds,
  roleID: state.RoleMappingReducer.roleID,
  roleMappingMenus: state.RoleMappingReducer,
  roleDomainList: state.RoleMappingReducer.roleDomainList,
  roleNameList: state.RoleMappingReducer.roleNameList,
  landingPageValues: state.RoleMappingReducer.landingPageValues,
  roleApiSuccess: state.RoleMappingReducer.roleApiSuccess,
  roleApiError: state.RoleMappingReducer.roleApiError,
  roleApiMsg: state.RoleMappingReducer.roleApiMsg,
  loader: state.RoleMappingReducer.loader,
  currentRoleId: state.LoginReducer.roleId,
  tableData: state.RoleMappingGridReducer.tableData,
  tableTotalCount: state.RoleMappingGridReducer.tableTotalCount,
  tableRowsPerPage: state.RoleMappingGridReducer.tableRowsPerPage,
  columnNameLastSorted: state.RoleMappingGridReducer.columnNameLastSorted,
  columnLastSortedType: state.RoleMappingGridReducer.columnLastSortedType,
  columnSortDirection: state.RoleMappingGridReducer.columnSortDirection,
  filtersSelectedValues: state.RoleMappingGridReducer.filtersSelectedValues,
  filtersValues: state.RoleMappingGridReducer.filtersValues,
  columnData: state.RoleMappingGridReducer.columnData,
  lastSentFilters: state.RoleMappingGridReducer.lastSentFilters,
  deactivateApiSuccess: state.RoleMappingReducer.deactivateApiSuccess,
  deactivateApiError: state.RoleMappingReducer.deactivateApiError,
  deactivateApiMsg: state.RoleMappingReducer.deactivateApiMsg,
});

export default withRouter(
  connect(
    mapStateToProps,
    {
      getAllRoles,
      getAllMenus,
      getMenusByRoleID,
      setMenuIds,
      getRolePrivileges,
      getUsersListMappedWithRole,
      muiTableStoreFilterInit,
      muiTableStoreColumnData,
      muiTableUpdatePage,
      muiTableUpdateFilter,
      muiTableClearSearch,
      fndeactivateUser,
      fnremoveRoleMappedWithUser,
      clearRoleMapping,
      setPrivilegeIds,
      assignRoleMenus,
      assignPrivilege,
      refreshUserRole,
      setFirstTab,
      getRoleNames,
      submitNewRole,
      clearRoleMsg,
      getLandingPageValues,
      submitNewTabMenu,
      updateTabMenuDetails,
      setLoader,
      searchUserTag,
	  clearDeactivateMsg
    }
  )(RoleMapping)
);