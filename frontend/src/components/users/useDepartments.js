import { useState } from 'react';
import { toast } from 'react-toastify';
import axiosInstance from '../../utils/axiosInstance';

const useDepartments = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch departments from the API
  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("api/users/departments/");
      setDepartments(response.data);
    } catch (error) {
      toast.error("Failed to fetch departments.");
      console.error(error); // Log error for debugging
    } finally {
      setLoading(false);
    }
  };

  // Create a new department
  const createDepartment = async (departmentData) => {
    try {
      const response = await axiosInstance.post("api/users/create-department/", departmentData);
      setDepartments((prevDepartments) => [...prevDepartments, response.data]);
      toast.success("Department created successfully!");
    } catch (error) {
      toast.error("Failed to create department.");
      console.error(error); // Log error for debugging
    }
  };

  // Update an existing department
  const updateDepartment = async (department) => {
    try {
      const response = await axiosInstance.put(`api/users/department-update/${department.id}/`, department); // Correct URL format
      setDepartments((prevDepartments) =>
        prevDepartments.map((dept) => (dept.id === department.id ? response.data : dept))
      );
      toast.success("Department updated successfully!");
    } catch (error) {
      toast.error("Failed to update department.");
      console.error(error); // Log error for debugging
    }
  };

  // Delete a department
  const deleteDepartment = async (departmentId) => {
    try {
      await axiosInstance.delete(`api/users/department-delete/${departmentId}/`); // Correct URL format
      setDepartments((prevDepartments) => prevDepartments.filter((dept) => dept.id !== departmentId));
      toast.success("Department deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete department.");
      console.error(error); // Log error for debugging
    }
  };

  return {
    departments,
    loading,
    fetchDepartments,
    createDepartment,
    updateDepartment,
    deleteDepartment,
  };
};

export default useDepartments;
