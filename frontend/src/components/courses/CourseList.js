import React, { useEffect, useState, useMemo } from "react";
import {
  CContainer,
  CTooltip,
  CButton,
  CSpinner,
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem,
  CFormInput,
} from "@coreui/react";
import DataTable from "react-data-table-component";
import CIcon from "@coreui/icons-react";
import { cilLibrary, cilPen, cilTrash, cilEyedropper } from "@coreui/icons";
import CourseUpdate from "./CourseUpdate";
import CourseDeleteConfirm from "./CourseDeleteConfirm";
import axiosInstance from "../../utils/axiosInstance";
import CourseCreate from "./CreateCourse";
import Modal from "../common/AGPModal";
import "animate.css";
import { useNavigate } from "react-router-dom";

// Helper to strip HTML tags and truncate
const stripAndTruncate = (html, length = 150) => {
  if (!html) return "";
  const div = document.createElement("div");
  div.innerHTML = html;
  const text = div.textContent || div.innerText || "";
  return text.length > length ? text.slice(0, length) + "..." : text;
};

const CourseList = () => {
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [modalAction, setModalAction] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [updatingStatusId, setUpdatingStatusId] = useState(null);
  const [confirmStatusCourse, setConfirmStatusCourse] = useState(null);
  const [filterText, setFilterText] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [coursesRes, categoriesRes] = await Promise.all([
          axiosInstance.get("/api/courses/courses/"),
          axiosInstance.get("/api/courses/categories/"),
        ]);
        setCourses(coursesRes.data);
        setCategories(categoriesRes.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleCreated = (newCourse) =>
    setCourses((prev) => [newCourse, ...prev]);

  const handleUpdated = (updated) =>
    setCourses((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));

  const handleDeleted = (id) =>
    setCourses((prev) => prev.filter((c) => c.id !== id));

  const requestStatusChange = (course) => {
    setConfirmStatusCourse(course);
  };

  const handleToggleStatus = async (course) => {
    setUpdatingStatusId(course.id);
    try {
      const updated = { ...course, is_active: !course.is_active };
      await axiosInstance.patch(`/api/courses/courses/${course.id}/`, {
        is_active: updated.is_active,
      });
      setCourses((prev) =>
        prev.map((c) => (c.id === updated.id ? updated : c))
      );
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setUpdatingStatusId(null);
      setConfirmStatusCourse(null);
    }
  };

  const openModal = (action, course = null) => {
    setModalAction(action);
    setSelectedCourse(course);
  };

  const closeModal = () => {
    setModalAction(null);
    setSelectedCourse(null);
  };

  const filteredCourses = useMemo(() => {
    return courses.filter(
      (course) =>
        course.name.toLowerCase().includes(filterText.toLowerCase()) ||
        (course.category_name &&
          course.category_name.toLowerCase().includes(filterText.toLowerCase()))
    );
  }, [courses, filterText]);

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
            alt="Logo"
            style={{
              width: "50px",
              height: "50px",
              objectFit: "cover",
              borderRadius: "4px",
            }}
          />
        ) : (
          <span>-</span>
        ),
      width: "70px",
      center: true,
    },
    {
      name: "Name",
      selector: (row) => row.name,
      sortable: true,
      wrap: true,
      grow: 1,
    },
    {
      name: "Category",
      selector: (row) => row.category_name || "-",
      sortable: true,
      wrap: true,
      grow: 1,
    },
    {
      name: "Summary",
      selector: (row) => stripAndTruncate(row.summary),
      wrap: true,
      grow: 2,
      cell: (row) => (
        <span>{stripAndTruncate(row.summary)}</span>
      ),
    },
    {
      name: "Status",
      cell: (row) =>
        updatingStatusId === row.id ? (
          <CSpinner size="sm" />
        ) : (
          <CDropdown>
            <CDropdownToggle
              size="sm"
              variant="outline"
              color={row.is_active ? "success" : "secondary"}
              className="animate__animated animate__fadeIn"
            >
              {row.is_active ? "Active" : "Inactive"}
            </CDropdownToggle>
            <CDropdownMenu>
              <CDropdownItem onClick={() => requestStatusChange(row)}>
                {row.is_active ? "Deactivate" : "Activate"}
              </CDropdownItem>
            </CDropdownMenu>
          </CDropdown>
        ),
      center: true,
      width: "130px",
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
          <CTooltip content="View Detail">
            <CButton
              size="sm"
              color="warning"
              variant="outline"
              onClick={() => navigate(`/dashboard/course-detail/${row.id}`)}
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
      width: "130px",
    },
  ];

  return (
    <CContainer fluid className="p-3 bg-light">
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <h4 className="fw-bold m-0">Courses</h4>
        <div className="d-flex align-items-center gap-3">
          <CFormInput
            size="sm"
            placeholder="Search by name or category"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            style={{ maxWidth: "300px" }}
          />
          <CTooltip content="Add New Course">
            <CButton color="primary" onClick={() => openModal("create")}>
              <CIcon icon={cilLibrary} className="me-2" />
            </CButton>
          </CTooltip>
        </div>
      </div>

      {loading ? (
        <div className="d-flex justify-content-center p-4">
          <CSpinner />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={filteredCourses}
          pagination
          highlightOnHover
          pointerOnHover
          responsive
          noHeader
          paginationRowsPerPageOptions={[5, 10, 15, 20]}
          paginationPerPage={10}
          striped
          persistTableHead
          customStyles={customStyles}
          className="shadow-sm bg-white rounded"
        />
      )}

      {/* Modals */}
      <Modal
        isOpen={!!modalAction}
        onClose={closeModal}
        title={{
          create: "Create Course",
          update: "Update Course",
          delete: "Delete Course",
        }[modalAction]}
        size={["create", "update"].includes(modalAction) ? "lg" : ""}
      >
        {modalAction === "create" && (
          <CourseCreate
            categories={categories}
            onCreated={handleCreated}
            onClose={closeModal}
          />
        )}
        {modalAction === "update" && (
          <CourseUpdate
            course={selectedCourse}
            categories={categories}
            onUpdated={handleUpdated}
            onClose={closeModal}
          />
        )}
        {modalAction === "delete" && (
          <CourseDeleteConfirm
            course={selectedCourse}
            onDeleted={handleDeleted}
            onClose={closeModal}
          />
        )}
      </Modal>

      {/* Status Change Confirmation */}
      <Modal
        isOpen={!!confirmStatusCourse}
        onClose={() => setConfirmStatusCourse(null)}
        title="Confirm Status Change"
      >
        <p>
          Are you sure you want to{" "}
          <strong>{confirmStatusCourse?.is_active ? "deactivate" : "activate"}</strong>{" "}
          the course <strong>{confirmStatusCourse?.name}</strong>?
        </p>
        <div className="d-flex justify-content-end gap-2">
          <CButton
            color="secondary"
            variant="outline"
            onClick={() => setConfirmStatusCourse(null)}
          >
            Cancel
          </CButton>
          <CButton
            color={confirmStatusCourse?.is_active ? "danger" : "success"}
            onClick={() => handleToggleStatus(confirmStatusCourse)}
          >
            Yes, {confirmStatusCourse?.is_active ? "Deactivate" : "Activate"}
          </CButton>
        </div>
      </Modal>
    </CContainer>
  );
};

export default CourseList;
