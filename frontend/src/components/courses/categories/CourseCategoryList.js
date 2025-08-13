import React, { useEffect, useState, useMemo } from "react";
import {
  CContainer,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CTooltip,
  CButton,
  CSpinner,
  CFormInput,
} from "@coreui/react";
import CIcon from "@coreui/icons-react";
import { cilPen, cilTrash, cilFolder } from "@coreui/icons";
import axiosInstance from "../../../utils/axiosInstance";
import AGPModal from "../../common/AGPModal";
import CategoryCreate from "./CreateCourseCategory";
import CategoryUpdate from "./CourseCategoryUpdate";
import CategoryDeleteConfirm from "./CourseCategoryDeleteConfirm";
import { useNavigate } from "react-router-dom";

const stripAndTruncate = (html, length = 150) => {
  if (!html) return '';
  const div = document.createElement('div');
  div.innerHTML = html;
  const text = div.textContent || div.innerText || '';
  return text.length > length ? `${text.slice(0, length)}…` : text;
};


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

  return (
    <CContainer fluid className="p-3 bg-light">
      {/* Header and search */}
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <h4 className="fw-bold m-0">Categories</h4>
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
          <CSpinner />
        </div>
      ) : (
        <CTable striped hover responsive className="shadow-sm bg-white rounded">
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell scope="col" style={{ width: "40px" }}>
                #
              </CTableHeaderCell>
              <CTableHeaderCell scope="col">Name</CTableHeaderCell>
              <CTableHeaderCell scope="col" style={{ width: "70px" }}>
                Logo
              </CTableHeaderCell>
              <CTableHeaderCell scope="col">Description</CTableHeaderCell>
              <CTableHeaderCell scope="col" style={{ width: "120px" }}>
                Parent
              </CTableHeaderCell>
              <CTableHeaderCell scope="col" style={{ width: "180px" }}>
                Created At
              </CTableHeaderCell>
              <CTableHeaderCell
                scope="col"
                className="text-center"
                style={{ width: "110px" }}
              >
                Actions
              </CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {filteredCategories.map((cat, idx) => (
              <CTableRow key={cat.id} verticalAlign="middle">
                <CTableDataCell>{idx + 1}</CTableDataCell>
                <CTableDataCell>
                  <a
                    href="#!"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate(`/dashboard/category-detail/${cat.slug}`);
                    }}
                    
                  >
                    {cat.name}
                  </a>
                </CTableDataCell>
                <CTableDataCell>
                  {cat.logo ? (
                    <img
                      src={cat.logo}
                      alt={cat.name}
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        objectFit: "cover",
                        border: "1px solid #ddd",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: 40,
                        height: 40,
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
                  )}
                </CTableDataCell>

               <CTableDataCell style={{ whiteSpace: 'normal' }}>
                  {cat.description ? (
                    <span title={stripAndTruncate(cat.description, 300)}>
                      {stripAndTruncate(cat.description, 150)}
                    </span>
                  ) : (
                    <span className="text-muted">No Description</span>
                  )}
                </CTableDataCell>

                <CTableDataCell>{cat.parent_name || "–"}</CTableDataCell>

                <CTableDataCell>
                  {cat.created_at
                    ? new Date(cat.created_at).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "–"}
                </CTableDataCell>

                <CTableDataCell
                  className="text-center"
                  style={{ whiteSpace: "nowrap" }}
                >
                  <CTooltip content="Edit">
                    <button
                      className="icon-btn edit-btn"
                      onClick={() => openModal("update", cat)}
                      style={{ marginRight: 8 }}
                    >
                      <CIcon icon={cilPen} style={{ height: 18, width: 18 }} />
                    </button>
                  </CTooltip>

                  <CTooltip content="Delete">
                    <button
                      className="icon-btn delete-btn"
                      onClick={() => openModal("delete", cat)}
                    >
                      <CIcon icon={cilTrash} style={{ height: 18, width: 18 }} />
                    </button>
                  </CTooltip>
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
