const updateAvatar = async (userId, file) => {
    const formData = new FormData();
    formData.append("avatar", file);
  
    try {
      const res = await fetch(`${API_URL}/users/${userId}/avatar`, {
        method: "PUT",
        body: formData,
      });
      const data = await res.json();
      console.log("Avatar updated:", data);
    } catch (err) {
      console.error("Lỗi cập nhật avatar:", err);
    }
  };
  
  const updateCoverImage = async (userId, file) => {
    const formData = new FormData();
    formData.append("coverImage", file);
  
    try {
      const res = await fetch(`${API_URL}/users/${userId}/cover`, {
        method: "PUT",
        body: formData,
      });
      const data = await res.json();
      console.log("Cover image updated:", data);
    } catch (err) {
      console.error("Lỗi cập nhật cover:", err);
    }
  };
  