<script>
  const firebaseConfig = {
    apiKey: "AIzaSyAIZJ65VfJX-KWMS0hb05-WWhudMSsz-_c",
    authDomain: "mikro-c8998.firebaseapp.com",
    projectId: "mikro-c8998",
    storageBucket: "mikro-c8998.appspot.com",
    messagingSenderId: "180409134328",
    appId: "1:180409134328:web:fb0f479b8db3b1af5a1f0d",
    measurementId: "G-QEXHW4F7PV"
  };

  firebase.initializeApp(firebaseConfig);
  const auth = firebase.auth();
  const db = firebase.firestore();

  function toggleRegisterModal() {
    const modal = document.getElementById("registerModal");
    modal.style.display = modal.style.display === "flex" ? "none" : "flex";
    document.getElementById("signInModal").style.display = "none";
  }

  function toggleSignInModal() {
    const modal = document.getElementById("signInModal");
    modal.style.display = modal.style.display === "none" ? "flex" : "none";
  }

  function registerUser() {
    const email = document.getElementById("regEmail").value.trim();
    const password = document.getElementById("regPassword").value;
    const username = document.getElementById("regUsername").value.trim();
    const province = document.getElementById("regProvince").value;
    const city = document.getElementById("regCity").value;
    const kecamatan = document.getElementById("regKecamatan").value;
    const postal = document.getElementById("regPostalCode").value;
    const fullAddress = document.getElementById("regFullAddress").value;

    if (!email.includes("@") || !email.includes(".")) {
      alert("Please enter a valid email address.");
      return;
    }

    auth.createUserWithEmailAndPassword(email, password)
      .then(userCredential => {
        const user = userCredential.user;
        return user.updateProfile({
          displayName: username,
          photoURL: "default-user.png"
        }).then(() => {
          return db.collection("users").doc(user.uid).set({
            username,
            email,
            address: { province, city, kecamatan, postalCode: postal, fullAddress },
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
          });
        }).then(() => user.sendEmailVerification({ url: window.location.origin + "/index.html" }));
      })
      .then(() => {
        document.getElementById("registerModal").style.display = "none";
        alert("Verification email sent. Please check your inbox.");
      })
      .catch(error => alert(error.message));
  }

  function signInUser() {
    const email = document.getElementById("signInEmail").value.trim();
    const password = document.getElementById("signInPassword").value;

    auth.signInWithEmailAndPassword(email, password)
      .then(() => {
        alert("Signed in successfully");
        toggleSignInModal();
      })
      .catch(error => alert(error.message));
  }

  function signInWithGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider)
      .then(async result => {
        const user = result.user;
        const userRef = db.collection("users").doc(user.uid);

        const doc = await userRef.get();
        if (!doc.exists) {
          await userRef.set({
            username: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
          });
        }

        alert("Signed in with Google");
      })
      .catch(error => alert("Google Sign-In failed: " + error.message));
  }

  function toggleProfileMenu() {
    document.getElementById("profileMenu").classList.toggle("hidden");
  }

  function deleteAccount() {
    const user = auth.currentUser;
    if (confirm("Are you sure you want to delete your account?")) {
      db.collection("users").doc(user.uid).delete();
      user.delete().then(() => {
        alert("Account deleted");
        window.location.reload();
      }).catch(error => alert(error.message));
    }
  }

  function signOutUser() {
    auth.signOut().then(() => {
      alert("Signed out");
      window.location.reload();
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    auth.onAuthStateChanged(user => {
      const greeting = document.getElementById("userGreeting");
      const signInBtn = document.getElementById("signInBtn");
      const profileTab = document.getElementById("profileTab");
      const userPhoto = document.getElementById("userPhoto");

      if (user && user.emailVerified) {
        // Fetch username from Firestore
        db.collection("users").doc(user.uid).get().then(doc => {
          const username = doc.exists ? doc.data().username : user.displayName || user.email;
          greeting.textContent = `Welcome, ${username}`;
        });

        greeting.style.display = "inline";
        signInBtn.style.display = "none";
        profileTab.style.display = "flex";
        if (userPhoto) userPhoto.src = user.photoURL || "default-user.png";
      } else {
        greeting.style.display = "none";
        signInBtn.style.display = "inline";
        profileTab.style.display = "none";
      }
    });
  });
// Add these new functions
function toggleProfileMenu() {
  const menu = document.getElementById("profileMenu");
  menu.style.display = menu.style.display === "block" ? "none" : "block";
}

// Close profile menu when clicking outside
document.addEventListener('click', function(event) {
  const profileContainer = document.querySelector('.profile-container');
  const profileMenu = document.getElementById("profileMenu");
  
  if (!profileContainer.contains(event.target) && profileMenu.style.display === 'block') {
    profileMenu.style.display = 'none';
  }
});

// Modified auth state listener
auth.onAuthStateChanged(user => {
  const greeting = document.getElementById("userGreeting");
  const signInBtn = document.getElementById("signInBtn");
  const profileTab = document.getElementById("profileTab");
  const userPhoto = document.getElementById("userPhoto");

  if (user) {
    console.log("User signed in:", user); // Debug log
    
    // Check if email is verified (for email/password users)
    if (user.providerData[0].providerId === 'password' && !user.emailVerified) {
      alert("Please verify your email address. Check your inbox.");
      auth.signOut();
      return;
    }

    // Get user data from Firestore
    db.collection("users").doc(user.uid).get().then(doc => {
      if (doc.exists) {
        console.log("User document:", doc.data()); // Debug log
      }
      
      const userData = doc.exists ? doc.data() : {};
      const username = userData.username || user.displayName || user.email.split('@')[0];
      greeting.textContent = `Welcome, ${username}`;
      
      // Set profile picture
      userPhoto.src = user.photoURL || "default-user.png";
    }).catch(error => {
      console.error("Error getting user document:", error);
    });

    // Update UI
    greeting.style.display = "inline";
    signInBtn.style.display = "none";
    profileTab.style.display = "block";
    
    console.log("UI should be updated now"); // Debug log
  } else {
    console.log("User signed out"); // Debug log
    // User signed out
    greeting.style.display = "none";
    signInBtn.style.display = "inline";
    profileTab.style.display = "none";
    userPhoto.src = "default-user.png";
  }
});

// Ensure registerUser creates user document
function registerUser() {
  // ... [your existing registration code]
  function signInUser() {
  const email = document.getElementById("signInEmail").value.trim();
  const password = document.getElementById("signInPassword").value;

  console.log("Attempting to sign in with:", email); // Debug line 1
  
  auth.signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      console.log("Sign in successful, user:", userCredential.user); // Debug line 2
      console.log("User UID:", userCredential.user.uid); // Debug line 3
      console.log("Email verified?", userCredential.user.emailVerified); // Debug line 4
      
      // Check if user exists in Firestore
      return db.collection("users").doc(userCredential.user.uid).get()
        .then(doc => {
          console.log("Firestore user document exists?", doc.exists); // Debug line 5
          if (doc.exists) {
            console.log("User data:", doc.data()); // Debug line 6
          }
          return userCredential;
        });
    })
    .then((userCredential) => {
      alert("Signed in successfully");
      toggleSignInModal();
    })
    .catch(error => {
      console.error("Sign in error:", error); // Debug line 7
      console.error("Error code:", error.code); // Debug line 8
      console.error("Error message:", error.message); // Debug line 9
      alert(error.message);
    });
}
  auth.createUserWithEmailAndPassword(email, password)
    .then(userCredential => {
      const user = userCredential.user;
      return db.collection("users").doc(user.uid).set({
        username,
        email,
        photoURL: "", // Important for email/password users
        address: { province, city, kecamatan, postalCode: postal, fullAddress },
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      }).then(() => {
        console.log("User document created for:", user.uid); // Debug log
        return user.sendEmailVerification();
      });
    })
    .then(() => {
      document.getElementById("registerModal").style.display = "none";
      alert("Verification email sent. Please check your inbox.");
    })
    .catch(error => {
      console.error("Registration error:", error); // Debug log
      alert(error.message);
    });
}

// Update registerUser function
function registerUser() {
  // ... [keep all your existing registration code]
  // Just ensure it creates the user document in Firestore
  // with at least these fields:
  db.collection("users").doc(user.uid).set({
    username,
    email,
    photoURL: "", // Empty for email/password users
    // ... [rest of your existing fields]
  });
}

</script>
