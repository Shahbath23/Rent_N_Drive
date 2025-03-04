export default function userReducer(state, action) {
    switch (action.type) {
      case "LOGIN":
        return { ...state, ...action.payload };
  
      case "LOGOUT":
        return {}; // Clears user state
  
      case "UPDATE_PROFILE_PICTURE":
        return {
          ...state,
          user: {
            ...state.user,
            profilePicture: action.payload.profilePicture, // Correct payload structure
          },
        };
  
      default:
        return state;
    }
  }
  