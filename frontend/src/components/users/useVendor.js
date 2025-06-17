import { useState } from 'react';
import { toast } from 'react-toastify';
import axiosInstance from '../../utils/axiosInstance'; 
const useVendors = () => {
  const [vendors, setVendors] = useState([]); 
  const [categories, setCategories] = useState([]); 
  const [loading, setLoading] = useState(false); 
  const [selectedVendor, setSelectedVendor] = useState(null); 

  const fetchVendors = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("api/vendor/vendors/"); 
      setVendors(response.data); 
    } catch (error) {
      toast.error("Failed to fetch vendors.");
      console.error(error); 
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axiosInstance.get("api/vendor/vendor-categories/"); 
      setCategories(response.data); 
    } catch (error) {
      toast.error("Failed to fetch categories.");
      console.error(error); 
    }
  };

  const createVendor = async (vendorData) => {
    try {
      const payload = {
        name: vendorData.name,
        email: vendorData.email,
        phone_number: vendorData.phone_number,
        address: vendorData.address,
        gst_number: vendorData.gst_number,
        status: vendorData.status,
        categories: vendorData.categories.map((category) => category.id), 
      };

      const response = await axiosInstance.post("api/vendor/vendors/", payload);
      
      setVendors((prevVendors) => [...prevVendors, response.data]); 
      toast.success("Vendor created successfully!");
    } catch (error) {
      if (error.response) {
        console.error("Error response:", error.response);
        toast.error(`Error: ${error.response.data.detail || "Failed to create vendor"}`);
      } else {
        console.error("Error:", error);
        toast.error("Failed to create vendor.");
      }
    }
  };

  const updateVendor = async (vendor) => {
    try {
      const payload = {
        name: vendor.name,
        email: vendor.email,
        phone_number: vendor.phone_number,
        address: vendor.address,
        gst_number: vendor.gst_number,
        status: vendor.status,
        categories: vendor.categories.map((category) => category.id), 
      };

      const response = await axiosInstance.put(`api/vendor/vendors/${vendor.id}/`, payload);
      setVendors((prevVendors) =>
        prevVendors.map((v) => (v.id === vendor.id ? response.data : v)) 
      );
      toast.success("Vendor updated successfully!");
    } catch (error) {
      if (error.response) {
        console.error("Error response:", error.response);
        toast.error(`Error: ${error.response.data.detail || "Failed to update vendor"}`);
      } else {
        console.error("Error:", error);
        toast.error("Failed to update vendor.");
      }
    }
  };

  const deleteVendor = async (id) => {
    try {
      await axiosInstance.delete(`api/vendor/vendors/${id}/`); 
      setVendors((prevVendors) => prevVendors.filter((vendor) => vendor.id !== id)); 
      toast.success("Vendor deleted successfully!");
    } catch (error) {
      if (error.response) {
        console.error("Error response:", error.response);
        toast.error(`Error: ${error.response.data.detail || "Failed to delete vendor"}`);
      } else {
        console.error("Error:", error);
        toast.error("Failed to delete vendor.");
      }
    }
  };

  return {
    vendors,
    categories,
    loading,
    fetchVendors,
    fetchCategories,
    createVendor,
    updateVendor,
    deleteVendor,
  };
};
export default useVendors;
