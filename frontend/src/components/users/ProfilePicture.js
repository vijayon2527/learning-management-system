import React, { useState, useEffect } from 'react';
import { CContainer, CButton, CForm, CFormInput, CSpinner, CCard, CCardBody, CCardHeader } from '@coreui/react';
import axiosInstance from '../../utils/axiosInstance';
import { toast } from 'react-toastify';
import MediaDisplay from '../common/MediaDisplay'; // Reusable Media Display Component

const ProfilePicture = () => {
  const [profilePic, setProfilePic] = useState(null); 
  const [selectedFile, setSelectedFile] = useState(null); 
  const [isLoading, setIsLoading] = useState(false);

  // Fetch the current profile picture on component mount
  useEffect(() => {
    const fetchProfilePicture = async () => {
      try {
        const response = await axiosInstance.get('/api/users/profile_pic/');
        setProfilePic(response.data.profile_pic); // Set the relative media URL
      } catch (err) {
        toast.error('Error fetching profile picture. Please try again.');
      }
    };

    fetchProfilePicture();
  }, []);

  // Handle file selection
  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]); // Store selected file
  };

  // Handle form submission for updating the profile picture
  const handleFormSubmit = async (event) => {
    event.preventDefault();

    if (!selectedFile) {
      toast.warning('Please select a file to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('profile_pic', selectedFile); // Append the selected file

    setIsLoading(true);

    try {
      const response = await axiosInstance.put('/api/users/profile_pic/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data', // Ensure proper content type
        },
      });
      setProfilePic(response.data.profile_pic); // Update the profile picture URL
      toast.success('Profile picture updated successfully!');
      setSelectedFile(null); // Reset file input after successful update
    } catch (err) {
      toast.error('Error updating profile picture. Please try again.');
    } finally {
      setIsLoading(false); // Set loading state to false after the request finishes
    }
  };

  return (
    <CContainer>
      <CCard>
        <CCardBody>
          <div className="text-center">
            {profilePic ? (
              // Use the reusable MediaDisplay component
              <MediaDisplay
                mediaUrl={profilePic}
                altText="Profile Picture"
                style={{
                  borderRadius: '50%', // Make the image round
                  width: '370px', // Adjust the width as needed
                  height: '370px', // Adjust the height as needed
                  objectFit: 'cover', // Ensure the image fits the circle
                }}
              />
            ) : (
              <p>No profile picture available.</p>
            )}
          </div>

          <CForm onSubmit={handleFormSubmit} className="mt-4">
            <div className="mb-3">
              <CFormInput
                type="file"
                onChange={handleFileChange}
                label="Choose a new profile picture"
                accept="image/*"
                required
              />
            </div>
            <CButton
              type="submit"
              color="primary"
              className="w-100"
              disabled={isLoading}
            >
              {isLoading ? <CSpinner size="sm" /> : 'Update Profile Picture'}
            </CButton>
          </CForm>
        </CCardBody>
      </CCard>
    </CContainer>
  );
};

export default ProfilePicture;
 






