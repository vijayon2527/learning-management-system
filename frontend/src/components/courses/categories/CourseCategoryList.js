import React, { useEffect, useState, useMemo } from "react";
import {
  CContainer,
  CTooltip,
  CButton,
  CSpinner,
  CFormInput,
} from "@coreui/react";
import DataTable from "react-data-table-component";
import CIcon from "@coreui/icons-react";
import { cilFolder, cilPen, cilTrash, cilEyedropper } from "@coreui/icons";
import axiosInstance from "../../../utils/axiosInstance";
import AGPModal from "../../common/AGPModal";
import CategoryCreate from "./CreateCourseCategory";
import CategoryUpdate from "./CourseCategoryUpdate";
import CategoryDeleteConfirm from "./CourseCategoryDeleteConfirm";
import { useNavigate } from "react-router-dom";

const CategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [modalAction, setModalAction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filterText, setFilterText] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get("/api/courses/categories/");
        setCategories(response.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const handleCategoryCreated = (newCategory) =>
    setCategories((prev) => [newCategory, ...prev]);

  const handleCategoryUpdated = (updatedCategory) =>
    setCategories((prev) =>
      prev.map((cat) => (cat.id === updatedCategory.id ? updatedCategory : cat))
    );

  const handleCategoryDeleted = (categoryId) =>
    setCategories((prev) => prev.filter((cat) => cat.id !== categoryId));

  const openModal = (action, category = null) => {
    setModalAction(action);
    setSelectedCategory(category);
  };

  const closeModal = () => {
    setModalAction(null);
    setSelectedCategory(null);
  };

  const filteredCategories = useMemo(() => {
    return categories.filter(
      (cat) =>
        cat.name.toLowerCase().includes(filterText.toLowerCase()) ||
        (cat.description &&
          cat.description.toLowerCase().includes(filterText.toLowerCase())) ||
        (cat.parent_name &&
          cat.parent_name.toLowerCase().includes(filterText.toLowerCase()))
    );
  }, [categories, filterText]);

  const columns = [
    {
      name: "#",
      selector: (_, index) => index + 1,
      width: "60px",
    },
    {
      name: "Logo",
      selector: (row) => row.logo,
      cell: (row) =>
        row.logo ? (
          <img
            src={row.logo}
            alt={row.name}
            style={{
              width: 50,
              height: 50,
              borderRadius: "50%",
              objectFit: "cover",
              border: "1px solid #ddd",
            }}
          />
        ) : (
          <div
            style={{
              width: 50,
              height: 50,
              borderRadius: "50%",
              backgroundColor: "#eee",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
              color: "#aaa",
              border: "1px solid #ddd",
            }}
          >
            N/A
          </div>
        ),
      width: "70px",
      center: true,
    },
    {
      name: "Name",
      selector: (row) => row.name || "No Name",
      sortable: true,
      wrap: true,
      grow: 1,
    },
    {
      name: "Description",
      selector: (row) => row.description || "-",
      wrap: true,
      grow: 2,
      cell: (row) => (
        <div
          style={{ whiteSpace: "normal" }}
          dangerouslySetInnerHTML={{
            __html: row.description || "<span class='text-muted'>-</span>",
          }}
        />
      ),
    },
    {
      name: "Parent",
      selector: (row) => row.parent_name || "No Parent",
      sortable: true,
      wrap: true,
      grow: 1,
    },
    {
      name: "Created At",
      selector: (row) =>
        row.created_at
          ? new Date(row.created_at).toLocaleDateString(undefined, {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })
          : "-",
      sortable: true,
      wrap: true,
      width: "180px",
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="d-flex gap-2">
          <CTooltip content="View Details">
            <CButton
              size="sm"
              color="warning"
              variant="outline"
              onClick={() => navigate(`/dashboard/category-detail/${row.id}`)}
            >
              <CIcon icon={cilEyedropper} />
            </CButton>
          </CTooltip>
          <CTooltip content="Edit">
            <CButton
              size="sm"
              color="info"
              variant="outline"
              onClick={() => openModal("update", row)}
            >
              <CIcon icon={cilPen} />
            </CButton>
          </CTooltip>
          <CTooltip content="Delete">
            <CButton
              size="sm"
              color="danger"
              variant="outline"
              onClick={() => openModal("delete", row)}
            >
              <CIcon icon={cilTrash} />
            </CButton>
          </CTooltip>
        </div>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
      width: "150px",
    },
  ];

  const customStyles = {
    cells: {
      style: {
        whiteSpace: "normal",
        overflow: "visible",
        textOverflow: "unset",
        padding: "10px",
      },
    },
  };

  return (
    <CContainer fluid className="p-3 bg-light">
      {/* Controls row like CourseList */}
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <h4 className="fw-bold m-0"></h4>
        <div className="d-flex align-items-center gap-3">
        <CFormInput
          size="sm"
          placeholder="Search by name, description or parent"
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          style={{ maxWidth: "250px" }}
        />
        <CTooltip content="Add New Category">
          <CButton color="primary" onClick={() => openModal("create")}>
            <CIcon icon={cilFolder} className="me-2" />
          </CButton>
        </CTooltip>
      </div>
      </div>

      {loading ? (
        <div className="d-flex justify-content-center p-4">
          <CSpinner color="primary" />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={filteredCategories}
          pagination
          highlightOnHover
          pointerOnHover
          responsive
          noHeader
          striped
          paginationRowsPerPageOptions={[5, 10, 15, 20]}
          paginationPerPage={10}
          persistTableHead
          customStyles={customStyles}
          className="shadow-sm bg-white rounded"
        />
      )}

      {/* Modal */}
      <AGPModal
        isOpen={!!modalAction}
        onClose={closeModal}
        title={{
          create: "Create Category",
          update: "Update Category",
          delete: "Delete Category",
        }[modalAction]}
        size={["create", "update"].includes(modalAction) ? "lg" : ""}
      >
        {modalAction === "create" && (
          <CategoryCreate
            onCreated={handleCategoryCreated}
            onClose={closeModal}
            categories={categories}
          />
        )}
        {modalAction === "update" && (
          <CategoryUpdate
            category={selectedCategory}
            onUpdated={handleCategoryUpdated}
            onClose={closeModal}
            categories={categories}
          />
        )}
        {modalAction === "delete" && (
          <CategoryDeleteConfirm
            category={selectedCategory}
            onDeleted={handleCategoryDeleted}
            onClose={closeModal}
          />
        )}
      </AGPModal>
    </CContainer>
  );
};

export default CategoryList;
