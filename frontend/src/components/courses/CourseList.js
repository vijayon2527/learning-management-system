import React, { useEffect, useState } from "react";
import MaterialUpdate from "./CourseUpdate";
import MaterialDeleteConfirm from "./CourseDeleteConfirm";
import AGPModal from "../common/AGPModal";
import CreateCourseCategory from "./CreateCourse";
import MaterialDetail from "./CourseDetail";
import {
  CContainer,
  CTooltip,
  CTable,
  CTableHead,
  CTableBody,
  CTableRow,
  CTableHeaderCell,
  CTableDataCell,
  CSpinner,
  CButton,
} from "@coreui/react";
import CIcon from "@coreui/icons-react";
import { cilUserPlus, cilPen, cilTrash } from "@coreui/icons";
import axiosInstance from "../../utils/axiosInstance";
import PermissionWrapper from "../common/RoleWrapper";
import Permissions from "../common/Roles";

const CourseList = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [modalAction, setModalAction] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get("/api/course/categories/");
        setCategories(response.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleCategoryCreated = (newCategory) => {
    setCategories((prev) => [newCategory, ...prev]);
  };

  const handleCategoryUpdated = (updatedCategory) => {
    setCategories((prev) =>
      prev.map((category) => (category.id === updatedCategory.id ? updatedCategory : category))
    );
  };

  const handleCategoryDeleted = (categoryId) => {
    setCategories((prev) => prev.filter((category) => category.id !== categoryId));
  };

  const openModal = (action, category = null) => {
    setModalAction(action);
    setSelectedCategory(category);
  };

  const closeModal = () => {
    setModalAction(null);
    setSelectedCategory(null);
  };

  return (
    <CContainer fluid className="p-3 bg-light">
      <PermissionWrapper requiredPermission={Permissions.ADD_COURSE_CATEGORY}>
        <CTooltip content="Add a Course" placement="top">
          <CButton color="primary" onClick={() => openModal("create")} className="mb-3 float-end">
            <CIcon icon={cilUserPlus} />
          </CButton>
        </CTooltip>
      </PermissionWrapper>
      
      {loading ? (
        <div className="d-flex justify-content-center p-4">
          <CSpinner color="primary" />
        </div>
      ) : (
        <CTable borderColor="dark">
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell>#</CTableHeaderCell>
              <CTableHeaderCell>Name</CTableHeaderCell>
              <CTableHeaderCell>Parent</CTableHeaderCell>
              <CTableHeaderCell>Created At</CTableHeaderCell>
              <CTableHeaderCell>Actions</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {categories.map((category, index) => (
              <CTableRow key={category.id}>
                <CTableDataCell>{index + 1}</CTableDataCell>
                <PermissionWrapper requiredPermission={Permissions.VIEW_COURSE_CATEGORY}>
                  <CTableDataCell>
                    <a
                      href="#"
                      onClick={() => openModal("detail", category)}
                      className="text-primary text-decoration-none"
                    >
                      {category.name}
                    </a>
                  </CTableDataCell>
                </PermissionWrapper>
                <CTableDataCell>{category.parent || "No Parent"}</CTableDataCell>
                <CTableDataCell>
                  {category.created_at ? new Date(category.created_at).toLocaleString() : "-"}
                </CTableDataCell>
                <CTableDataCell>
                  <PermissionWrapper requiredPermission={Permissions.CHANGE_COURSE_CATEGORY}>
                    <CIcon
                      icon={cilPen}
                      onClick={() => openModal("update", category)}
                      className="text-primary cursor-pointer me-2"
                      title="Update"
                    />
                  </PermissionWrapper>
                  <PermissionWrapper requiredPermission={Permissions.DELETE_COURSE_CATEGORY}>
                    <CIcon
                      icon={cilTrash}
                      onClick={() => openModal("delete", category)}
                      className="text-danger cursor-pointer"
                      title="Delete"
                    />
                  </PermissionWrapper>
                </CTableDataCell>
              </CTableRow>
            ))}
          </CTableBody>
        </CTable>
      )}

      <AGPModal
        isOpen={!!modalAction}
        onClose={closeModal}
        title={{
          create: "Create Course Category",
          update: "Update Course Category",
          delete: "Delete Course Category",
          detail: "Course Category Details",
        }[modalAction]}
        size={["create", "update", "detail"].includes(modalAction) ? "lg" : ""}
      >
        {modalAction === "create" && (
          <CreateCourseCategory onMaterialCreated={handleCategoryCreated} onClose={closeModal} categories={categories} />
        )}
        {modalAction === "update" && (
          <MaterialUpdate
            materialId={selectedCategory?.id}
            onClose={closeModal}
            onMaterialUpdated={handleCategoryUpdated}
            categories={categories}
          />
        )}
        {modalAction === "detail" && <MaterialDetail material={selectedCategory} onClose={closeModal} />}
        {modalAction === "delete" && (
          <MaterialDeleteConfirm
            courseCategory={selectedCategory}
            onClose={closeModal}
            removeCourseCategory={handleCategoryDeleted}
          />
        )}
      </AGPModal>
    </CContainer>
  );
};

export default CourseList;