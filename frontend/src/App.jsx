import { useEffect, useState } from "react"

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet"

import L from "leaflet"
import "leaflet/dist/leaflet.css"

import markerIcon from "leaflet/dist/images/marker-icon.png"
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png"
import markerShadow from "leaflet/dist/images/marker-shadow.png"

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
})


// ============================================================
// MAP CONTROLLER
// ============================================================

function MapViewController({ incidents }) {
  const map = useMap()

  useEffect(() => {
    const valid = incidents.filter(
      (incident) =>
        typeof incident.latitude === "number" &&
        typeof incident.longitude === "number"
    )

    if (valid.length === 0) {
      return
    }

    if (valid.length === 1) {
      map.setView(
        [valid[0].latitude, valid[0].longitude],
        16
      )
      return
    }

    const bounds = L.latLngBounds(
      valid.map((incident) => [
        incident.latitude,
        incident.longitude,
      ])
    )

    map.fitBounds(bounds, {
      padding: [50, 50],
    })
  }, [incidents, map])

  return null
}



// ============================================================
// ADMIN MAP MARKER
// ============================================================

function createPriorityIcon(priority) {
  const colors = {
    critical: "#8A4137",
    high: "#C97C5D",
    medium: "#A89A6A",
    low: "#71856F",
  }

  const color = colors[priority] || colors.medium

  return L.divIcon({
    className: "",
    html: `
      <div
        style="
          width: 18px;
          height: 18px;
          border-radius: 9999px;
          background: ${color};
          border: 3px solid white;
          box-shadow: 0 3px 10px rgba(0,0,0,0.22);
        "
      ></div>
    `,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
    popupAnchor: [0, -10],
  })
}


function AdminIncidentMap({ incidents }) {
  const mappedIncidents = incidents.filter(
    (incident) =>
      typeof incident.latitude === "number" &&
      typeof incident.longitude === "number"
  )

  return (
    <div className="overflow-hidden rounded-[28px] border border-[#E5DED2] bg-[#FFFDF8] dark:border-[#304238] dark:bg-[#202D25]">

      <div className="flex flex-col gap-4 border-b border-[#E5DED2] px-6 py-5 sm:flex-row sm:items-center sm:justify-between dark:border-[#304238]">

        <div>
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-[#71856F]">
            Campus map
          </p>

          <h3 className="mt-2 text-2xl font-semibold">
            Incident locations
          </h3>

          <p className="mt-2 text-sm text-[#777A72] dark:text-[#AEB9B1]">
            View reported incidents with available location data.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 text-xs">
          <span className="rounded-full bg-[#F0D7D2] px-3 py-1.5 text-[#8A4137] dark:bg-[#4A302D] dark:text-[#E5AAA2]">
            Critical
          </span>

          <span className="rounded-full bg-[#F1DED3] px-3 py-1.5 text-[#8A5746] dark:bg-[#49352F] dark:text-[#D7A99B]">
            High
          </span>

          <span className="rounded-full bg-[#E9E4D5] px-3 py-1.5 text-[#675E4B] dark:bg-[#3B392F] dark:text-[#D8CFB5]">
            Medium
          </span>

          <span className="rounded-full bg-[#DFE8DC] px-3 py-1.5 text-[#52664D] dark:bg-[#304036] dark:text-[#B8C9B4]">
            Low
          </span>
        </div>

      </div>

      {mappedIncidents.length === 0 ? (

        <div className="flex min-h-[360px] items-center justify-center px-6 text-center">

          <div>
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E7EBDD] text-2xl dark:bg-[#304238]">
              📍
            </div>

            <h4 className="mt-4 text-lg font-semibold">
              No mapped incidents yet
            </h4>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#777A72] dark:text-[#AEB9B1]">
              Incidents will appear here when students submit a report
              with a location.
            </p>
          </div>

        </div>

      ) : (

        <div className="h-[430px] w-full">

          <MapContainer
            center={[
              mappedIncidents[0].latitude,
              mappedIncidents[0].longitude,
            ]}
            zoom={15}
            scrollWheelZoom={true}
            className="h-full w-full"
          >

            <TileLayer
              attribution='&copy; OpenStreetMap contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <MapViewController
              incidents={mappedIncidents}
            />

            {mappedIncidents.map(
              (incident) => (

                <Marker
                  key={incident.id}
                  position={[
                    incident.latitude,
                    incident.longitude,
                  ]}
                  icon={createPriorityIcon(
                    incident.priority
                  )}
                >

                  <Popup>

                    <div className="min-w-[220px]">

                      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                        {incident.priority || "medium"} priority
                      </p>

                      <h4 className="mt-1 text-base font-semibold">
                        {incident.title}
                      </h4>

                      <p className="mt-2 text-sm">
                        {incident.location}
                      </p>

                      <p className="mt-2 text-xs text-gray-500">
                        Status: {formatPopupStatus(incident.status)}
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        Category: {incident.category}
                      </p>

                    </div>

                  </Popup>

                </Marker>

              )
            )}

          </MapContainer>

        </div>

      )}

      <div className="border-t border-[#E5DED2] px-6 py-4 text-sm text-[#777A72] dark:border-[#304238] dark:text-[#AEB9B1]">
        Showing {mappedIncidents.length} of {incidents.length} incident{incidents.length === 1 ? "" : "s"} with coordinates.
      </div>

    </div>
  )
}


function formatPopupStatus(status) {
  if (!status) {
    return "Unknown"
  }

  return status
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    )
}


// ============================================================
// APP
// ============================================================

function App() {

  // ==========================================================
  // THEME
  // ==========================================================

  const [darkMode, setDarkMode] = useState(() => {
    return (
      localStorage.getItem("campuscare-theme") === "dark"
    )
  })


  // ==========================================================
  // AUTH
  // ==========================================================

  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [token, setToken] = useState("")
  const [userRole, setUserRole] = useState("")
  const [userName, setUserName] = useState("")


  // ==========================================================
  // LOGIN
  // ==========================================================

  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  })


  // ==========================================================
  // STUDENT INCIDENT FORM
  // ==========================================================

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "infrastructure",
    location: "",
  })

  const [coordinates, setCoordinates] = useState(null)


  // ==========================================================
  // STUDENT INCIDENTS
  // ==========================================================

  const [incidents, setIncidents] = useState([])
  const [publicIncidents, setPublicIncidents] = useState([])
  const [loadingIncidents, setLoadingIncidents] = useState(false)


  // ==========================================================
  // INCIDENT PROGRESS MODAL
  // ==========================================================

  const [selectedIncident, setSelectedIncident] =
    useState(null)

  const [history, setHistory] = useState([])
  const [loadingHistory, setLoadingHistory] = useState(false)

  const [incidentComments, setIncidentComments] =
    useState([])

  const [loadingComments, setLoadingComments] =
    useState(false)


  // ==========================================================
  // ADMIN DATA
  // ==========================================================

  const [adminIncidents, setAdminIncidents] =
    useState([])

  const [adminStats, setAdminStats] =
    useState(null)

  const [loadingAdmin, setLoadingAdmin] =
    useState(false)

  const [staffMembers, setStaffMembers] =
    useState([])

  const [adminFilter, setAdminFilter] =
    useState("all")

  const [adminSearch, setAdminSearch] = useState("")


  // ==========================================================
  // STAFF DATA
  // ==========================================================

  const [staffIncidents, setStaffIncidents] =
    useState([])

  const [loadingStaff, setLoadingStaff] =
    useState(false)

  const [selectedStaffIncident, setSelectedStaffIncident] =
    useState(null)

  const [staffComments, setStaffComments] =
    useState([])

  const [staffCommentText, setStaffCommentText] =
    useState("")

  const [loadingStaffComments, setLoadingStaffComments] =
    useState(false)


  // ==========================================================
  // MESSAGES
  // ==========================================================

  const [message, setMessage] = useState("")
  const [error, setError] = useState("")


  // ==========================================================
  // THEME STORAGE
  // ==========================================================

  useEffect(() => {
    localStorage.setItem(
      "campuscare-theme",
      darkMode ? "dark" : "light"
    )
  }, [darkMode])


  // ==========================================================
  // COMMON HELPERS
  // ==========================================================

  const formatStatus = (status) => {
    if (!status) {
      return "Unknown"
    }

    return status
      .replaceAll("_", " ")
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      )
  }


  const formatDate = (date) => {
    if (!date) {
      return "Unknown"
    }

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    )
  }


  const formatDateTime = (date) => {
    if (!date) {
      return "Unknown"
    }

    return new Date(date).toLocaleString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    )
  }


  const getStatusStyle = (status) => {
    const styles = {
      reported:
        "bg-[#EEE8D9] text-[#665B45] dark:bg-[#3B392E] dark:text-[#E8DDBB]",

      under_review:
        "bg-[#E9E4D5] text-[#625B49] dark:bg-[#39372F] dark:text-[#D9D1B8]",

      assigned:
        "bg-[#E1EBDD] text-[#50664D] dark:bg-[#304238] dark:text-[#B9CBB8]",

      in_progress:
        "bg-[#DCE8DF] text-[#46634F] dark:bg-[#2D4035] dark:text-[#B8CDBD]",

      resolved:
        "bg-[#DCE9DE] text-[#46624C] dark:bg-[#2E4034] dark:text-[#B9CDBD]",

      closed:
        "bg-[#E5E5E0] text-[#555952] dark:bg-[#363B38] dark:text-[#C3CAC4]",

      rejected:
        "bg-[#F0DEDA] text-[#8A5146] dark:bg-[#49322F] dark:text-[#DDB1A8]",
    }

    return (
      styles[status] ||
      "bg-[#EEE8D9] text-[#665B45] dark:bg-[#3B392E] dark:text-[#E8DDBB]"
    )
  }


  const getPriorityStyle = (priority) => {
    const styles = {
      critical:
        "bg-[#F0D7D2] text-[#8A4137] dark:bg-[#4A302D] dark:text-[#E5AAA2]",

      high:
        "bg-[#F1DED3] text-[#8A5746] dark:bg-[#49352F] dark:text-[#D7A99B]",

      medium:
        "bg-[#E9E4D5] text-[#675E4B] dark:bg-[#3B392F] dark:text-[#D8CFB5]",

      low:
        "bg-[#DFE8DC] text-[#52664D] dark:bg-[#304036] dark:text-[#B8C9B4]",
    }

    return styles[priority] || styles.medium
  }


  const getNextStatuses = (status) => {
    const transitions = {
      reported: ["under_review"],
      under_review: ["assigned"],
      assigned: ["in_progress"],
      in_progress: ["resolved"],
      resolved: ["closed"],
      closed: [],
      rejected: [],
    }

    return transitions[status] || []
  }


  // ==========================================================
  // LOGIN
  // ==========================================================

  const handleLoginChange = (event) => {
    setLoginForm({
      ...loginForm,
      [event.target.name]: event.target.value,
    })
  }


  const handleLogin = async (event) => {
    event.preventDefault()

    setError("")
    setMessage("")

    try {
      const body = new URLSearchParams()

      body.append(
        "email",
        loginForm.email
      )

      body.append(
        "password",
        loginForm.password
      )
const response = await fetch(
  "http://127.0.0.1:8000/login",
  {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      email: loginForm.email,
      password: loginForm.password,
    }),
  }
)

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.detail || "Login failed"
        )
      }

      setToken(data.access_token)
      setUserRole(data.role)
      setUserName(data.name)
      setIsLoggedIn(true)

      setMessage(
        `Welcome back, ${data.name}!`
      )

      setLoginForm({
        email: "",
        password: "",
      })

    } catch (err) {
      setError(err.message)
    }
  }


  // ==========================================================
  // LOGOUT
  // ==========================================================

  const handleLogout = () => {
    setIsLoggedIn(false)
    setToken("")
    setUserRole("")
    setUserName("")

    setIncidents([])
    setAdminIncidents([])
    setAdminStats(null)
    setStaffIncidents([])

    setSelectedIncident(null)
    setSelectedStaffIncident(null)

    setHistory([])
    setIncidentComments([])
    setStaffComments([])

    setMessage("")
    setError("")
  }


  // ==========================================================
  // STUDENT: FETCH INCIDENTS
  // ==========================================================

  const fetchIncidents = async () => {
    if (!token) {
      return
    }

    setLoadingIncidents(true)

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/incidents/my",
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error(
          "Failed to load incidents"
        )
      }

      const data = await response.json()

      const list = Array.isArray(data)
        ? data
        : Array.isArray(data.incidents)
          ? data.incidents
          : []

      setIncidents(list)

    } catch (err) {

      console.error(err)
      setIncidents([])

    } finally {

      setLoadingIncidents(false)

    }
  }
const fetchPublicIncidents = async () => {
  if (!token) {
    return
  }

  try {
    const response = await fetch(
      "http://127.0.0.1:8000/incidents/public",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )

    if (!response.ok) {
      throw new Error("Failed to load campus incidents")
    }

    const data = await response.json()

    const list = Array.isArray(data)
      ? data
      : Array.isArray(data.incidents)
        ? data.incidents
        : []

    setPublicIncidents(list)
  } catch (err) {
    console.error(err)
  }
}

  // ==========================================================
  // ADMIN: FETCH DATA
  // ==========================================================

  const fetchAdminData = async () => {
    if (!token) {
      return
    }

    setLoadingAdmin(true)

    try {

      const headers = {
        Authorization:
          `Bearer ${token}`,
      }


      const [
        incidentsResponse,
        statsResponse,
        staffResponse,
      ] = await Promise.all([

        fetch(
          "http://127.0.0.1:8000/admin/incidents",
          {
            headers,
          }
        ),

        fetch(
          "http://127.0.0.1:8000/admin/stats",
          {
            headers,
          }
        ),

        fetch(
          "http://127.0.0.1:8000/admin/staff",
          {
            headers,
          }
        ),

      ])


      if (incidentsResponse.ok) {

        const data =
          await incidentsResponse.json()

        const list =
          Array.isArray(data)
            ? data
            : Array.isArray(
                data.incidents
              )
              ? data.incidents
              : []

        setAdminIncidents(list)
      }


      if (statsResponse.ok) {

        const stats =
          await statsResponse.json()

        setAdminStats(stats)
      }


      if (staffResponse.ok) {

        const staff =
          await staffResponse.json()

        setStaffMembers(
          Array.isArray(staff)
            ? staff
            : []
        )
      }

    } catch (err) {

      console.error(
        "Admin data error:",
        err
      )

    } finally {

      setLoadingAdmin(false)

    }
  }


  // ==========================================================
  // STAFF: FETCH INCIDENTS
  // ==========================================================

  const fetchStaffData = async () => {

    if (!token) {
      return
    }

    setLoadingStaff(true)

    try {

      const response =
        await fetch(
          "http://127.0.0.1:8000/staff/incidents",
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        )


      if (!response.ok) {
        throw new Error(
          "Failed to load staff incidents"
        )
      }


      const data =
        await response.json()


      const list =
        Array.isArray(data)
          ? data
          : Array.isArray(
              data.incidents
            )
            ? data.incidents
            : []


      setStaffIncidents(list)

    } catch (err) {

      console.error(
        "Staff data error:",
        err
      )

      setStaffIncidents([])

    } finally {

      setLoadingStaff(false)

    }
  }


  // ==========================================================
  // STAFF: OPEN INCIDENT
  // ==========================================================

  const openStaffIncident = async (
    incident
  ) => {

    setSelectedStaffIncident(
      incident
    )

    setStaffComments([])

    setStaffCommentText("")

    setLoadingStaffComments(true)

    setError("")

    try {

      const response =
        await fetch(
          `http://127.0.0.1:8000/incidents/${incident.id}/comments`,
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        )


      const data =
        await response.json()


      if (!response.ok) {

        throw new Error(
          data.detail ||
          "Failed to load comments"
        )

      }


      const comments =
        Array.isArray(data)
          ? data
          : Array.isArray(
              data.comments
            )
            ? data.comments
            : []


      setStaffComments(
        comments
      )

    } catch (err) {

      console.error(
        "Staff comments error:",
        err
      )

      setStaffComments([])

    } finally {

      setLoadingStaffComments(
        false
      )

    }
  }


  // ==========================================================
  // STAFF: CLOSE INCIDENT
  // ==========================================================

  const closeStaffIncident = () => {

    setSelectedStaffIncident(
      null
    )

    setStaffComments([])

    setStaffCommentText("")

  }


  // ==========================================================
  // STAFF: ADD COMMENT
  // ==========================================================

  const addStaffComment = async (
    event
  ) => {

    event.preventDefault()

    if (
      !selectedStaffIncident ||
      !staffCommentText.trim()
    ) {
      return
    }

    setError("")
    setMessage("")

    try {

      const response =
        await fetch(
          `http://127.0.0.1:8000/incidents/${selectedStaffIncident.id}/comments`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`,
            },

            body: JSON.stringify({
              comment:
                staffCommentText.trim(),
            }),
          }
        )


      const data =
        await response.json()


      if (!response.ok) {

        throw new Error(
          data.detail ||
          "Failed to add progress update"
        )

      }


      setStaffCommentText("")

      setMessage(
        "Progress update added successfully."
      )


      await openStaffIncident(
        selectedStaffIncident
      )

    } catch (err) {

      setError(
        err.message
      )

    }
  }


  // ==========================================================
  // STAFF: UPDATE STATUS
  // ==========================================================

  const updateStaffStatus = async (
    incidentId,
    newStatus
  ) => {

    setError("")
    setMessage("")

    try {

      const response =
  await fetch(
    `http://127.0.0.1:8000/staff/incidents/${incidentId}/status`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        status: newStatus,
      }),
    }
  )


      const data =
        await response.json()


      if (!response.ok) {

        throw new Error(
          data.detail ||
          "Failed to update status"
        )

      }


      setMessage(
        "Incident status updated successfully."
      )


      await fetchStaffData()


      if (
        selectedStaffIncident &&
        selectedStaffIncident.id ===
          incidentId
      ) {

        setSelectedStaffIncident({
          ...selectedStaffIncident,
          status: newStatus,
        })

      }

    } catch (err) {

      setError(
        err.message
      )

    }
  }


  // ==========================================================
  // LOAD ROLE DATA
  // ==========================================================

  useEffect(() => {

    if (
      !isLoggedIn ||
      !token
    ) {
      return
    }

    if (
      userRole === "student"
    ) {

      fetchIncidents()
      fetchPublicIncidents()

    }

    if (
      userRole === "admin"
    ) {

      fetchAdminData()

    }

    if (
      userRole === "staff"
    ) {

      fetchStaffData()

    }

  }, [
    isLoggedIn,
    token,
    userRole,
  ])


  // ==========================================================
  // STUDENT FORM
  // ==========================================================

  const handleFormChange = (
    event
  ) => {

    setForm({
      ...form,

      [event.target.name]:
        event.target.value,
    })

  }


  // ==========================================================
  // GET LOCATION
  // ==========================================================

  const getLocation = () => {

    setError("")
    setMessage("")

    if (
      !navigator.geolocation
    ) {

      setError(
        "Geolocation is not supported by your browser."
      )

      return
    }

    setMessage(
      "Getting your location..."
    )

    navigator.geolocation.getCurrentPosition(

      (position) => {

        setCoordinates({

          latitude:
            position.coords.latitude,

          longitude:
            position.coords.longitude,

        })

        setMessage(
          "Location captured successfully."
        )

      },

      () => {

        setError(
          "Unable to get your location. Please allow location access."
        )

      }

    )

  }


  // ==========================================================
  // STUDENT: SUBMIT INCIDENT
  // ==========================================================

  const handleSubmitIncident = async (
    event
  ) => {

    event.preventDefault()

    setError("")
    setMessage("")

    try {

      const incidentData = {

        title:
          form.title,

        description:
          form.description,

        category:
          form.category,

        location:
          form.location,

        latitude:
          coordinates?.latitude ??
          null,

        longitude:
          coordinates?.longitude ??
          null,

      }


      const response =
        await fetch(
          "http://127.0.0.1:8000/incidents",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`,
            },

            body:
              JSON.stringify(
                incidentData
              ),
          }
        )


      const data =
        await response.json()


      if (!response.ok) {

        throw new Error(
          data.detail ||
          "Failed to report incident"
        )

      }


      setMessage(
        `Incident #${data.incident_id} reported successfully.`
      )


      setForm({
        title: "",
        description: "",
        category:
          "infrastructure",
        location: "",
      })


      setCoordinates(null)


      await fetchIncidents()

    } catch (err) {

      setError(
        err.message
      )

    }
  }


  // ==========================================================
  // OPEN PROGRESS
  // ==========================================================

  const openProgress = async (
    incident
  ) => {

    setSelectedIncident(
      incident
    )

    setHistory([])

    setIncidentComments([])

    setLoadingHistory(true)

    setLoadingComments(true)

    setError("")

    try {

      const [
        historyResponse,
        commentsResponse,
      ] = await Promise.all([

        fetch(
          `http://127.0.0.1:8000/incidents/${incident.id}/history`,
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        ),

        fetch(
          `http://127.0.0.1:8000/incidents/${incident.id}/comments`,
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        ),

      ])


      const historyData =
        await historyResponse.json()

      const commentsData =
        await commentsResponse.json()


      if (
        !historyResponse.ok
      ) {

        throw new Error(
          historyData.detail ||
          "Failed to load progress history"
        )

      }


      if (
        !commentsResponse.ok
      ) {

        throw new Error(
          commentsData.detail ||
          "Failed to load progress updates"
        )

      }


      const historyList =
        Array.isArray(
          historyData
        )
          ? historyData
          : Array.isArray(
              historyData.history
            )
            ? historyData.history
            : []


      const commentsList =
        Array.isArray(
          commentsData.comments
        )
          ? commentsData.comments
          : []


      setHistory(
        historyList
      )

      setIncidentComments(
        commentsList
      )

    } catch (err) {

      console.error(
        "Progress loading error:",
        err
      )

      setHistory([])

      setIncidentComments([])

    } finally {

      setLoadingHistory(false)

      setLoadingComments(false)

    }
  }


  // ==========================================================
  // CLOSE PROGRESS
  // ==========================================================

  const closeProgress = () => {

    setSelectedIncident(
      null
    )

    setHistory([])

    setIncidentComments([])

    setLoadingHistory(false)

    setLoadingComments(false)

  }


  // ==========================================================
  // ADMIN: UPDATE STATUS
  // ==========================================================

  const updateAdminStatus = async (
    incidentId,
    newStatus
  ) => {

    setError("")
    setMessage("")


      try {
  const response =
    await fetch(
      `http://127.0.0.1:8000/admin/incidents/${incidentId}/status`,
      {
        method: "PATCH",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({
          status: newStatus,
        }),
      }
    )

      const data =
        await response.json()


      if (!response.ok) {

        throw new Error(
          data.detail ||
          "Failed to update status"
        )

      }


      setMessage(
        "Incident status updated successfully."
      )


      await fetchAdminData()

    } catch (err) {

      setError(
        err.message
      )

    }
  }


  // ==========================================================
  // ADMIN: ASSIGN STAFF
  // ==========================================================

  const assignStaff = async (
    incidentId,
    staffId
  ) => {

    if (!staffId) {
      return
    }

    setError("")
    setMessage("")

    try {

     const response =
  await fetch(
    `http://127.0.0.1:8000/admin/incidents/${incidentId}/assign`,
    {
      method: "PATCH",

      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },

      body: JSON.stringify({
        staff_id: Number(staffId),
      }),
    }
  )


      const data =
        await response.json()


      if (!response.ok) {

        throw new Error(
          data.detail ||
          "Failed to assign incident"
        )

      }


      setMessage(
        "Incident assigned successfully."
      )


      await fetchAdminData()

    } catch (err) {

      setError(
        err.message
      )

    }
  }


  // ==========================================================
  // ADMIN FILTER
  // ==========================================================

  const filteredAdminIncidents = adminIncidents.filter((incident) => {
    const matchesStatus =
        adminFilter === "all" ||
        incident.status === adminFilter

    const search = adminSearch.trim().toLowerCase()

    const matchesSearch =
        search === "" ||
        String(incident.id).includes(search) ||
        incident.title?.toLowerCase().includes(search) ||
        incident.description?.toLowerCase().includes(search) ||
        incident.location?.toLowerCase().includes(search) ||
        incident.category?.toLowerCase().includes(search)

    return matchesStatus && matchesSearch
})


  // ==========================================================
  // MAP INCIDENTS
  // ==========================================================

  const mappedIncidents =
    incidents.filter(
      (incident) =>
        typeof incident.latitude ===
          "number" &&
        typeof incident.longitude ===
          "number"
    )


  // ==========================================================
  // LOGIN SCREEN
  // ==========================================================

  if (!isLoggedIn) {

    return (

      <div
        className={`min-h-screen ${
          darkMode
            ? "dark bg-[#18231D] text-[#F5F1E8]"
            : "bg-[#F7F3EC] text-[#343733]"
        }`}
      >

        <button
          onClick={() =>
            setDarkMode(!darkMode)
          }
          className="fixed right-6 top-6 z-50 rounded-full border border-[#D8D2C7] bg-[#FFFDF8] px-4 py-2 text-sm font-medium shadow-sm dark:border-[#3A4C40] dark:bg-[#202D25] dark:text-[#F5F1E8]"
        >
          {darkMode
            ? "☀ Light"
            : "◐ Dark"}
        </button>


        <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-6 py-10">

          <div className="grid w-full max-w-5xl overflow-hidden rounded-[32px] border border-[#E5DED2] bg-[#FFFDF8] shadow-[0_20px_60px_rgba(67,76,65,0.10)] dark:border-[#304238] dark:bg-[#202D25] lg:grid-cols-2">


            <div className="flex flex-col justify-center px-8 py-12 sm:px-12 lg:px-16">

              <div className="mb-10">

                <div className="mb-5 inline-flex items-center gap-3">

                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#71856F] text-xl text-white">
                    C
                  </div>

                  <span className="text-xl font-semibold">
                    CampusCare
                  </span>

                </div>


                <h1 className="max-w-md text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">

                  A better campus starts with

                  <span className="text-[#71856F]">
                    {" "}being heard.
                  </span>

                </h1>


                <p className="mt-5 max-w-md text-base leading-7 text-[#777A72] dark:text-[#AEB9B1]">
                  Report campus issues, follow their progress,
                  and help make your campus a better place.
                </p>

              </div>


              <form
                onSubmit={handleLogin}
                className="space-y-5"
              >

                <div>

                  <label className="mb-2 block text-sm font-medium">
                    Email
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={
                      loginForm.email
                    }
                    onChange={
                      handleLoginChange
                    }
                    placeholder="you@example.com"
                    required
                    className="w-full rounded-2xl border border-[#D8D2C7] bg-[#F9F6F0] px-4 py-3.5 text-[#343733] outline-none focus:border-[#71856F] dark:border-[#3A4C40] dark:bg-[#18231D] dark:text-[#F5F1E8]"
                  />

                </div>


                <div>

                  <label className="mb-2 block text-sm font-medium">
                    Password
                  </label>

                  <input
                    type="password"
                    name="password"
                    value={
                      loginForm.password
                    }
                    onChange={
                      handleLoginChange
                    }
                    placeholder="Enter your password"
                    required
                    className="w-full rounded-2xl border border-[#D8D2C7] bg-[#F9F6F0] px-4 py-3.5 text-[#343733] outline-none focus:border-[#71856F] dark:border-[#3A4C40] dark:bg-[#18231D] dark:text-[#F5F1E8]"
                  />

                </div>


                {error && (

                  <div className="rounded-2xl bg-[#F0DEDA] px-4 py-3 text-sm text-[#8A5146] dark:bg-[#49322F] dark:text-[#DDB1A8]">
                    {error}
                  </div>

                )}


                <button
                  type="submit"
                  className="w-full rounded-2xl bg-[#344E41] px-5 py-3.5 font-medium text-white dark:bg-[#71856F]"
                >
                  Sign in
                </button>

              </form>

            </div>


            <div className="relative hidden min-h-[600px] overflow-hidden bg-[#E7EBDD] lg:block dark:bg-[#24352C]">

              <div className="absolute left-12 top-16 h-40 w-40 rounded-full bg-[#D9A6A1]/40 blur-2xl" />

              <div className="absolute bottom-20 right-12 h-56 w-56 rounded-full bg-[#C97C5D]/20 blur-3xl" />


              <div className="absolute inset-12 rounded-[28px] border border-white/50 bg-[#F7F3EC]/50 p-8 backdrop-blur-sm dark:border-white/10 dark:bg-[#18231D]/30">

                <div className="flex h-full flex-col justify-between">

                  <div>

                    <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#71856F]">
                      CampusCare
                    </p>

                    <h2 className="mt-5 max-w-sm text-4xl font-semibold leading-tight text-[#344E41] dark:text-[#F5F1E8]">
                      Small reports.
                      <br />
                      Meaningful change.
                    </h2>

                  </div>


                  <div className="rounded-3xl bg-[#FFFDF8]/80 p-6 shadow-sm dark:bg-[#202D25]/80">

                    <div className="mb-4 flex items-center justify-between">

                      <span className="text-sm font-medium">
                        Example report
                      </span>

                      <span className="rounded-full bg-[#DFE8DC] px-3 py-1 text-xs font-medium text-[#52664D]">
                        In Progress
                      </span>

                    </div>


                    <p className="font-medium">
                      Broken corridor light
                    </p>

                    <p className="mt-2 text-sm text-[#777A72] dark:text-[#AEB9B1]">
                      Block B, second floor corridor
                    </p>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

      </div>
    )
  }


  // ==========================================================
  // ADMIN DASHBOARD
  // ==========================================================

  if (userRole === "admin") {

    return (

      <div
        className={`min-h-screen ${
          darkMode
            ? "dark bg-[#18231D] text-[#F5F1E8]"
            : "bg-[#F7F3EC] text-[#343733]"
        }`}
      >

        <header className="border-b border-[#E5DED2] dark:border-[#304238]">

          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#71856F] font-semibold text-white">
                C
              </div>

              <div>

                <h1 className="font-semibold">
                  CampusCare
                </h1>

                <p className="text-xs text-[#777A72] dark:text-[#AEB9B1]">
                  Administration
                </p>

              </div>

            </div>


            <div className="flex items-center gap-3">

              <span className="hidden text-sm text-[#777A72] sm:block dark:text-[#AEB9B1]">
                {userName}
              </span>

              <button
                onClick={() =>
                  setDarkMode(!darkMode)
                }
                className="rounded-full border border-[#D8D2C7] bg-[#FFFDF8] px-4 py-2 text-sm dark:border-[#3A4C40] dark:bg-[#202D25]"
              >
                {darkMode
                  ? "☀ Light"
                  : "◐ Dark"}
              </button>

              <button
                onClick={handleLogout}
                className="rounded-full bg-[#344E41] px-4 py-2 text-sm font-medium text-white dark:bg-[#71856F]"
              >
                Sign out
              </button>

            </div>

          </div>

        </header>


        <main className="mx-auto max-w-7xl px-6 py-10">

          <div className="mb-10">

            <p className="text-sm font-medium uppercase tracking-[0.18em] text-[#71856F]">
              Administration
            </p>

            <h2 className="mt-3 text-4xl font-semibold">
              Campus incident overview.
            </h2>

            <p className="mt-3 max-w-2xl text-[#777A72] dark:text-[#AEB9B1]">
              Review reports, assign staff and manage incident
              progress from one place.
            </p>

          </div>


          {message && (

            <div className="mb-6 rounded-2xl bg-[#EDF3EA] px-5 py-4 text-sm text-[#52664D] dark:bg-[#26382E] dark:text-[#B9CBB8]">
              {message}
            </div>

          )}


          {error && (

            <div className="mb-6 rounded-2xl bg-[#F6E9E6] px-5 py-4 text-sm text-[#8A5146] dark:bg-[#3B2927] dark:text-[#DDB1A8]">
              {error}
            </div>

          )}


          <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

            <div className="rounded-[24px] border border-[#E5DED2] bg-[#FFFDF8] p-6 dark:border-[#304238] dark:bg-[#202D25]">

              <p className="text-sm text-[#777A72] dark:text-[#AEB9B1]">
                Total incidents
              </p>

              <p className="mt-3 text-4xl font-semibold">
                {adminStats?.total ??
                  adminIncidents.length}
              </p>

            </div>


            <div className="rounded-[24px] border border-[#E5DED2] bg-[#FFFDF8] p-6 dark:border-[#304238] dark:bg-[#202D25]">

              <p className="text-sm text-[#777A72] dark:text-[#AEB9B1]">
                Reported
              </p>

              <p className="mt-3 text-4xl font-semibold">
                {
                  adminIncidents.filter(
                    (i) =>
                      i.status ===
                      "reported"
                  ).length
                }
              </p>

            </div>


            <div className="rounded-[24px] border border-[#E5DED2] bg-[#FFFDF8] p-6 dark:border-[#304238] dark:bg-[#202D25]">

              <p className="text-sm text-[#777A72] dark:text-[#AEB9B1]">
                In progress
              </p>

              <p className="mt-3 text-4xl font-semibold">
                {
                  adminIncidents.filter(
                    (i) =>
                      i.status ===
                        "assigned" ||
                      i.status ===
                        "in_progress"
                  ).length
                }
              </p>

            </div>


            <div className="rounded-[24px] border border-[#E5DED2] bg-[#FFFDF8] p-6 dark:border-[#304238] dark:bg-[#202D25]">

              <p className="text-sm text-[#777A72] dark:text-[#AEB9B1]">
                Resolved
              </p>

              <p className="mt-3 text-4xl font-semibold">
                {
                  adminIncidents.filter(
                    (i) =>
                      i.status ===
                        "resolved" ||
                      i.status ===
                        "closed"
                  ).length
                }
              </p>

            </div>

          </section>


          <section className="mt-10">
            <AdminIncidentMap
              incidents={adminIncidents}
            />
          </section>


          <section className="mt-10">

            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

              <div>

                <p className="text-sm font-medium uppercase tracking-[0.18em] text-[#71856F]">
                  Management
                </p>

                <h3 className="mt-2 text-3xl font-semibold">
                  All incidents
                </h3>

              </div>

              <input
                  type="text"
                  value={adminSearch}
                  onChange={(e) => setAdminSearch(e.target.value)}
                  placeholder="Search incidents..."
                  className="w-full rounded-2xl border border-[#D8D2C7] bg-[#FFFDF8] px-4 py-3 text-sm outline-none transition focus:border-[#8FA58B] dark:border-[#3A4C40] dark:bg-[#202D25]"
              />

              <select
                value={adminFilter}
                onChange={(e) =>
                  setAdminFilter(
                    e.target.value
                  )
                }
                className="rounded-2xl border border-[#D8D2C7] bg-[#FFFDF8] px-4 py-3 text-sm dark:border-[#3A4C40] dark:bg-[#202D25]"
              >

                <option value="all">
                  All incidents
                </option>

                <option value="reported">
                  Reported
                </option>

                <option value="under_review">
                  Under Review
                </option>

                <option value="assigned">
                  Assigned
                </option>

                <option value="in_progress">
                  In Progress
                </option>

                <option value="resolved">
                  Resolved
                </option>

                <option value="closed">
                  Closed
                </option>

              </select>

            </div>


            {loadingAdmin ? (

              <div className="rounded-[28px] border border-[#E5DED2] bg-[#FFFDF8] p-10 text-center dark:border-[#304238] dark:bg-[#202D25]">
                Loading incidents...
              </div>

            ) : filteredAdminIncidents.length === 0 ? (

              <div className="rounded-[28px] border border-[#E5DED2] bg-[#FFFDF8] p-10 text-center dark:border-[#304238] dark:bg-[#202D25]">
                No incidents found.
              </div>

            ) : (

              <div className="space-y-5">

                {filteredAdminIncidents.map(
                  (incident) => (

                    <div
                      key={incident.id}
                      className="rounded-[26px] border border-[#E5DED2] bg-[#FFFDF8] p-6 dark:border-[#304238] dark:bg-[#202D25]"
                    >

                      <div className="flex flex-col gap-6 lg:flex-row lg:justify-between">

                        <div className="flex-1">

                          <div className="flex flex-wrap gap-2">

                            <span
                              className={`rounded-full px-3 py-1.5 text-xs font-medium ${getStatusStyle(
                                incident.status
                              )}`}
                            >
                              {formatStatus(
                                incident.status
                              )}
                            </span>

                            <span
                              className={`rounded-full px-3 py-1.5 text-xs font-medium ${getPriorityStyle(
                                incident.priority
                              )}`}
                            >
                              {incident.priority}
                            </span>

                          </div>


                          <h4 className="mt-4 text-xl font-semibold">
                            {incident.title}
                          </h4>


                          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#777A72] dark:text-[#AEB9B1]">
                            {incident.description}
                          </p>


                          <div className="mt-5 flex flex-wrap gap-4 text-sm">

                            <span>
                              📍 {incident.location}
                            </span>

                            <span>
                              Category:{" "}
                              <span className="capitalize">
                                {incident.category}
                              </span>
                            </span>

                            <p className="mt-1 text-xs text-gray-500">
                                Staff:{" "}
                                {incident.assigned_to?.name || "Not assigned"}
                              </p>

                            <span>
                              Reported:{" "}
                              {formatDate(
                                incident.created_at
                              )}
                            </span>

                          </div>

                        </div>


                        <div className="w-full space-y-3 lg:w-64">

                          <label className="block text-xs font-medium uppercase tracking-wide text-[#777A72] dark:text-[#87948C]">
                            Update status
                          </label>


                          <select
                            value={
                              incident.status
                            }
                            onChange={(e) =>
                              updateAdminStatus(
                                incident.id,
                                e.target.value
                              )
                            }
                            className="w-full rounded-xl border border-[#D8D2C7] bg-[#F9F6F0] px-3 py-2.5 text-sm dark:border-[#3A4C40] dark:bg-[#18231D]"
                          >

                            <option
                              value={
                                incident.status
                              }
                            >
                              {formatStatus(
                                incident.status
                              )}
                            </option>

                            {getNextStatuses(
                              incident.status
                            ).map(
                              (status) => (

                                <option
                                  key={status}
                                  value={status}
                                >
                                  Move to{" "}
                                  {formatStatus(
                                    status
                                  )}
                                </option>

                              )
                            )}

                          </select>


                          <label className="block pt-2 text-xs font-medium uppercase tracking-wide text-[#777A72] dark:text-[#87948C]">
                            Assign staff
                          </label>


                          <select
                            defaultValue={incident.assigned_to?.id || ""}
                            onChange={(e) =>
                              assignStaff(
                                incident.id,
                                e.target.value
                              )
                            }
                            className="w-full rounded-xl border border-[#D8D2C7] bg-[#F9F6F0] px-3 py-2.5 text-sm dark:border-[#3A4C40] dark:bg-[#18231D]"
                          >

                            <option value="">
                              Select staff
                            </option>

                            {staffMembers.map(
                              (staff) => (

                                <option
                                  key={staff.id}
                                  value={staff.id}
                                >
                                  {staff.name}
                                </option>

                              )
                            )}

                          </select>


                          <button
                            onClick={() =>
                              openProgress(
                                incident
                              )
                            }
                            className="w-full rounded-xl border border-[#C9D3C5] bg-[#F3F6EF] px-3 py-2.5 text-sm font-medium text-[#52664D] dark:border-[#46594D] dark:bg-[#26382E] dark:text-[#B9CBB8]"
                          >
                            View progress
                          </button>

                        </div>

                      </div>

                    </div>

                  )
                )}

              </div>

            )}

          </section>

        </main>


        {selectedIncident && (

          <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 px-4 py-8 backdrop-blur-sm">

            <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[30px] border border-[#E5DED2] bg-[#FFFDF8] p-7 shadow-2xl dark:border-[#304238] dark:bg-[#202D25]">

              <button
                onClick={closeProgress}
                className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full bg-[#EDEBE2] text-lg dark:bg-[#304238]"
              >
                ×
              </button>


              <p className="text-sm font-medium uppercase tracking-[0.18em] text-[#71856F]">
                Incident progress
              </p>


              <h3 className="mt-3 pr-10 text-2xl font-semibold">
                {selectedIncident.title}
              </h3>


              <div className="mt-6 rounded-2xl bg-[#F3F1E9] p-5 dark:bg-[#26382E]">

                <p className="text-xs uppercase tracking-wide text-[#777A72] dark:text-[#87948C]">
                  Current status
                </p>

                <span
                  className={`mt-3 inline-flex rounded-full px-3 py-1.5 text-xs font-medium ${getStatusStyle(
                    selectedIncident.status
                  )}`}
                >
                  {formatStatus(
                    selectedIncident.status
                  )}
                </span>

              </div>


              <h4 className="mt-8 text-lg font-semibold">
                Status history
              </h4>


              {loadingHistory ? (

                <p className="mt-5 text-sm text-[#777A72] dark:text-[#AEB9B1]">
                  Loading history...
                </p>

              ) : history.length === 0 ? (

                <p className="mt-5 text-sm text-[#777A72] dark:text-[#AEB9B1]">
                  No history available.
                </p>

              ) : (

                <div className="mt-6 space-y-5">

                  {history.map(
                    (entry, index) => (

                      <div
                        key={
                          entry.id ??
                          index
                        }
                        className="flex gap-4"
                      >

                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#71856F] text-xs text-white">
                          ✓
                        </div>

                        <div>

                          <p className="font-medium">
                            {formatStatus(
                              entry.status
                            )}
                          </p>

                          <p className="mt-1 text-xs text-[#777A72] dark:text-[#87948C]">
                            {formatDateTime(
                              entry.changed_at
                            )}
                          </p>

                        </div>

                      </div>

                    )
                  )}

                </div>

              )}


              <h4 className="mt-10 text-lg font-semibold">
                Progress updates
              </h4>


              {loadingComments ? (

                <p className="mt-5 text-sm text-[#777A72] dark:text-[#AEB9B1]">
                  Loading progress updates...
                </p>

              ) : incidentComments.length === 0 ? (

                <div className="mt-5 rounded-2xl border border-dashed border-[#D8D2C7] p-5 text-sm text-[#777A72] dark:border-[#3A4C40] dark:text-[#AEB9B1]">
                  No progress updates yet.
                </div>

              ) : (

                <div className="mt-5 space-y-4">

                  {incidentComments.map(
                    (comment, index) => (

                      <div
                        key={
                          comment.id ??
                          index
                        }
                        className="rounded-2xl bg-[#F3F1E9] p-5 dark:bg-[#26382E]"
                      >

                        <p className="text-sm leading-6">
                          {comment.comment}
                        </p>

                        {comment.created_at && (

                          <p className="mt-3 text-xs text-[#777A72] dark:text-[#87948C]">
                            {formatDateTime(
                              comment.created_at
                            )}
                          </p>

                        )}

                      </div>

                    )
                  )}

                </div>

              )}


              <button
                onClick={closeProgress}
                className="mt-8 rounded-xl bg-[#344E41] px-5 py-2.5 text-sm font-medium text-white dark:bg-[#71856F]"
              >
                Done
              </button>

            </div>

          </div>

        )}

      </div>
    )
  }


  // ==========================================================
  // STAFF DASHBOARD
  // ==========================================================

  if (userRole === "staff") {

    return (

      <div
        className={`min-h-screen ${
          darkMode
            ? "dark bg-[#18231D] text-[#F5F1E8]"
            : "bg-[#F7F3EC] text-[#343733]"
        }`}
      >

        <header className="border-b border-[#E5DED2] dark:border-[#304238]">

          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#71856F] font-semibold text-white">
                C
              </div>

              <div>

                <h1 className="font-semibold">
                  CampusCare
                </h1>

                <p className="text-xs text-[#777A72] dark:text-[#AEB9B1]">
                  Staff workspace
                </p>

              </div>

            </div>


            <div className="flex items-center gap-3">

              <span className="hidden text-sm text-[#777A72] sm:block dark:text-[#AEB9B1]">
                {userName}
              </span>

              <button
                onClick={() =>
                  setDarkMode(!darkMode)
                }
                className="rounded-full border border-[#D8D2C7] bg-[#FFFDF8] px-4 py-2 text-sm dark:border-[#3A4C40] dark:bg-[#202D25]"
              >
                {darkMode
                  ? "☀ Light"
                  : "◐ Dark"}
              </button>

              <button
                onClick={handleLogout}
                className="rounded-full bg-[#344E41] px-4 py-2 text-sm font-medium text-white dark:bg-[#71856F]"
              >
                Sign out
              </button>

            </div>

          </div>

        </header>


        <main className="mx-auto max-w-7xl px-6 py-10">

          <div className="mb-10">

            <p className="text-sm font-medium uppercase tracking-[0.18em] text-[#71856F]">
              Staff workspace
            </p>

            <h2 className="mt-3 text-4xl font-semibold tracking-tight">
              Your assigned work.
            </h2>

            <p className="mt-3 max-w-2xl text-[#777A72] dark:text-[#AEB9B1]">
              Review campus issues assigned to you and keep
              students updated as the work progresses.
            </p>

          </div>


          {message && (

            <div className="mb-6 rounded-2xl bg-[#EDF3EA] px-5 py-4 text-sm text-[#52664D] dark:bg-[#26382E] dark:text-[#B9CBB8]">
              {message}
            </div>

          )}


          {error && (

            <div className="mb-6 rounded-2xl bg-[#F6E9E6] px-5 py-4 text-sm text-[#8A5146] dark:bg-[#3B2927] dark:text-[#DDB1A8]">
              {error}
            </div>

          )}


          <section className="grid gap-5 sm:grid-cols-3">

            <div className="rounded-[24px] border border-[#E5DED2] bg-[#FFFDF8] p-6 dark:border-[#304238] dark:bg-[#202D25]">

              <p className="text-sm text-[#777A72] dark:text-[#AEB9B1]">
                Assigned
              </p>

              <p className="mt-3 text-4xl font-semibold">
                {
                  staffIncidents.filter(
                    (incident) =>
                      incident.status ===
                      "assigned"
                  ).length
                }
              </p>

            </div>


            <div className="rounded-[24px] border border-[#E5DED2] bg-[#FFFDF8] p-6 dark:border-[#304238] dark:bg-[#202D25]">

              <p className="text-sm text-[#777A72] dark:text-[#AEB9B1]">
                In progress
              </p>

              <p className="mt-3 text-4xl font-semibold">
                {
                  staffIncidents.filter(
                    (incident) =>
                      incident.status ===
                      "in_progress"
                  ).length
                }
              </p>

            </div>


            <div className="rounded-[24px] border border-[#E5DED2] bg-[#FFFDF8] p-6 dark:border-[#304238] dark:bg-[#202D25]">

              <p className="text-sm text-[#777A72] dark:text-[#AEB9B1]">
                Resolved
              </p>

              <p className="mt-3 text-4xl font-semibold">
                {
                  staffIncidents.filter(
                    (incident) =>
                      incident.status ===
                      "resolved"
                  ).length
                }
              </p>

            </div>

          </section>


          <section className="mt-10">
            <div className="rounded-[28px] border border-[#E5DED2] bg-[#FFFDF8] p-2 dark:border-[#304238] dark:bg-[#202D25]">
              <AdminIncidentMap
                incidents={staffIncidents}
              />
            </div>
          </section>


          <section className="mt-10">

            <div className="mb-6">

              <p className="text-sm font-medium uppercase tracking-[0.18em] text-[#71856F]">
                Assigned incidents
              </p>

              <h3 className="mt-2 text-3xl font-semibold">
                Work queue
              </h3>

            </div>


            {loadingStaff ? (

              <div className="rounded-[28px] border border-[#E5DED2] bg-[#FFFDF8] p-10 text-center dark:border-[#304238] dark:bg-[#202D25]">
                Loading assigned incidents...
              </div>

            ) : staffIncidents.length === 0 ? (

              <div className="rounded-[28px] border border-[#E5DED2] bg-[#FFFDF8] p-10 text-center dark:border-[#304238] dark:bg-[#202D25]">

                <p className="text-lg font-medium">
                  No incidents assigned to you.
                </p>

                <p className="mt-2 text-sm text-[#777A72] dark:text-[#AEB9B1]">
                  New assignments from the administrator will appear here.
                </p>

              </div>

            ) : (

              <div className="grid gap-5 lg:grid-cols-2">

                {staffIncidents.map(
                  (incident) => (

                    <article
                      key={incident.id}
                      className="rounded-[26px] border border-[#E5DED2] bg-[#FFFDF8] p-6 dark:border-[#304238] dark:bg-[#202D25]"
                    >

                      <div className="flex flex-wrap gap-2">

                        <span
                          className={`rounded-full px-3 py-1.5 text-xs font-medium ${getStatusStyle(
                            incident.status
                          )}`}
                        >
                          {formatStatus(
                            incident.status
                          )}
                        </span>

                        <span
                          className={`rounded-full px-3 py-1.5 text-xs font-medium ${getPriorityStyle(
                            incident.priority
                          )}`}
                        >
                          {incident.priority}
                        </span>

                      </div>


                      <h3 className="mt-5 text-xl font-semibold">
                        {incident.title}
                      </h3>


                      <p className="mt-2 line-clamp-3 text-sm leading-6 text-[#777A72] dark:text-[#AEB9B1]">
                        {incident.description}
                      </p>


                      <div className="mt-5 space-y-2 text-sm">

                        <p>
                          📍 {incident.location}
                        </p>

                        <p className="text-[#777A72] dark:text-[#AEB9B1]">
                          Reported{" "}
                          {formatDate(
                            incident.created_at
                          )}
                        </p>

                      </div>


                      <div className="mt-6">

                        <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-[#777A72] dark:text-[#87948C]">
                          Update status
                        </label>

                        <select
                          value={
                            incident.status
                          }
                          onChange={(e) =>
                            updateStaffStatus(
                              incident.id,
                              e.target.value
                            )
                          }
                          className="w-full rounded-xl border border-[#D8D2C7] bg-[#F9F6F0] px-3 py-3 text-sm dark:border-[#3A4C40] dark:bg-[#18231D]"
                        >

                          <option
                            value={
                              incident.status
                            }
                          >
                            {formatStatus(
                              incident.status
                            )}
                          </option>


                          {incident.status ===
                            "assigned" && (

                            <option value="in_progress">
                              Move to In Progress
                            </option>

                          )}


                          {incident.status ===
                            "in_progress" && (

                            <option value="resolved">
                              Mark as Resolved
                            </option>

                          )}

                        </select>

                      </div>


                      <button
                        onClick={() =>
                          openStaffIncident(
                            incident
                          )
                        }
                        className="mt-4 w-full rounded-xl border border-[#C9D3C5] bg-[#F3F6EF] px-4 py-3 text-sm font-medium text-[#52664D] dark:border-[#46594D] dark:bg-[#26382E] dark:text-[#B9CBB8]"
                      >
                        Open incident details →
                      </button>

                    </article>

                  )
                )}

              </div>

            )}

          </section>

        </main>


        {selectedStaffIncident && (

          <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 px-4 py-8 backdrop-blur-sm">

            <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[30px] border border-[#E5DED2] bg-[#FFFDF8] p-7 shadow-2xl dark:border-[#304238] dark:bg-[#202D25]">

              <button
                onClick={
                  closeStaffIncident
                }
                className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full bg-[#EDEBE2] text-lg dark:bg-[#304238]"
              >
                ×
              </button>


              <div className="pr-10">

                <div className="flex flex-wrap gap-2">

                  <span
                    className={`rounded-full px-3 py-1.5 text-xs font-medium ${getStatusStyle(
                      selectedStaffIncident.status
                    )}`}
                  >
                    {formatStatus(
                      selectedStaffIncident.status
                    )}
                  </span>

                  <span
                    className={`rounded-full px-3 py-1.5 text-xs font-medium ${getPriorityStyle(
                      selectedStaffIncident.priority
                    )}`}
                  >
                    {selectedStaffIncident.priority}
                  </span>

                </div>


                <h3 className="mt-4 text-3xl font-semibold">
                  {selectedStaffIncident.title}
                </h3>

              </div>


              <div className="mt-7">

                <p className="text-xs font-medium uppercase tracking-[0.15em] text-[#71856F]">
                  Issue description
                </p>

                <p className="mt-3 text-sm leading-7 text-[#777A72] dark:text-[#AEB9B1]">
                  {selectedStaffIncident.description}
                </p>

              </div>


              <div className="mt-7 rounded-2xl bg-[#F3F1E9] p-5 dark:bg-[#26382E]">

                <p className="text-xs font-medium uppercase tracking-[0.15em] text-[#71856F]">
                  Location
                </p>

                <p className="mt-2 font-medium">
                  📍 {selectedStaffIncident.location}
                </p>

              </div>


              <div className="mt-8">

                <div className="flex items-center justify-between">

                  <h4 className="text-lg font-semibold">
                    Progress updates
                  </h4>

                  <span className="text-xs text-[#777A72] dark:text-[#87948C]">
                    {staffComments.length}{" "}
                    update
                    {staffComments.length ===
                    1
                      ? ""
                      : "s"}
                  </span>

                </div>


                {loadingStaffComments ? (

                  <p className="mt-5 text-sm text-[#777A72] dark:text-[#AEB9B1]">
                    Loading updates...
                  </p>

                ) : staffComments.length ===
                  0 ? (

                  <div className="mt-5 rounded-2xl border border-dashed border-[#D8D2C7] p-5 text-sm text-[#777A72] dark:border-[#3A4C40] dark:text-[#AEB9B1]">
                    No progress updates yet.
                  </div>

                ) : (

                  <div className="mt-5 space-y-4">

                    {staffComments.map(
                      (comment, index) => (

                        <div
                          key={
                            comment.id ??
                            index
                          }
                          className="rounded-2xl bg-[#F3F1E9] p-4 dark:bg-[#26382E]"
                        >

                          <p className="text-sm leading-6">
                            {comment.comment}
                          </p>

                          {comment.created_at && (

                            <p className="mt-2 text-xs text-[#777A72] dark:text-[#87948C]">
                              {formatDateTime(
                                comment.created_at
                              )}
                            </p>

                          )}

                        </div>

                      )
                    )}

                  </div>

                )}


                <form
                  onSubmit={
                    addStaffComment
                  }
                  className="mt-5"
                >

                  <textarea
                    value={
                      staffCommentText
                    }
                    onChange={(e) =>
                      setStaffCommentText(
                        e.target.value
                      )
                    }
                    placeholder="Add a progress update for the student..."
                    rows="3"
                    className="w-full resize-none rounded-2xl border border-[#D8D2C7] bg-[#F9F6F0] px-4 py-3 text-sm outline-none focus:border-[#71856F] dark:border-[#3A4C40] dark:bg-[#18231D]"
                  />


                  <button
                    type="submit"
                    disabled={
                      !staffCommentText.trim()
                    }
                    className="mt-3 rounded-xl bg-[#344E41] px-5 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-40 dark:bg-[#71856F]"
                  >
                    Add progress update
                  </button>

                </form>

              </div>


              <button
                onClick={
                  closeStaffIncident
                }
                className="mt-8 rounded-xl border border-[#D8D2C7] px-5 py-2.5 text-sm font-medium dark:border-[#3A4C40]"
              >
                Close
              </button>

            </div>

          </div>

        )}

      </div>
    )
  }


  // ==========================================================
  // STUDENT DASHBOARD
  // ==========================================================

  return (

    <div
      className={`min-h-screen ${
        darkMode
          ? "dark bg-[#18231D] text-[#F5F1E8]"
          : "bg-[#F7F3EC] text-[#343733]"
      }`}
    >

      <header className="border-b border-[#E5DED2] dark:border-[#304238]">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#71856F] font-semibold text-white">
              C
            </div>

            <div>

              <h1 className="font-semibold">
                CampusCare
              </h1>

              <p className="text-xs text-[#777A72] dark:text-[#AEB9B1]">
                Student dashboard
              </p>

            </div>

          </div>


          <div className="flex items-center gap-3">

            <span className="hidden text-sm text-[#777A72] sm:block dark:text-[#AEB9B1]">
              {userName}
            </span>

            <button
              onClick={() =>
                setDarkMode(!darkMode)
              }
              className="rounded-full border border-[#D8D2C7] bg-[#FFFDF8] px-4 py-2 text-sm dark:border-[#3A4C40] dark:bg-[#202D25]"
            >
              {darkMode
                ? "☀ Light"
                : "◐ Dark"}
            </button>

            <button
              onClick={handleLogout}
              className="rounded-full bg-[#344E41] px-4 py-2 text-sm font-medium text-white dark:bg-[#71856F]"
            >
              Sign out
            </button>

          </div>

        </div>

      </header>


      <main className="mx-auto max-w-7xl px-6 py-10">

        <div className="mb-10">

          <p className="text-sm font-medium uppercase tracking-[0.18em] text-[#71856F]">
            Student workspace
          </p>

          <h2 className="mt-3 text-4xl font-semibold tracking-tight">
            Good to see you, {userName}.
          </h2>

          <p className="mt-3 max-w-2xl text-[#777A72] dark:text-[#AEB9B1]">
            Report campus problems and keep track of what happens next.
          </p>

        </div>


        {message && (

          <div className="mb-6 rounded-2xl bg-[#EDF3EA] px-5 py-4 text-sm text-[#52664D] dark:bg-[#26382E] dark:text-[#B9CBB8]">
            {message}
          </div>

        )}


        {error && (

          <div className="mb-6 rounded-2xl bg-[#F6E9E6] px-5 py-4 text-sm text-[#8A5146] dark:bg-[#3B2927] dark:text-[#DDB1A8]">
            {error}
          </div>

        )}


        <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">

          <div className="rounded-[28px] border border-[#E5DED2] bg-[#FFFDF8] p-7 dark:border-[#304238] dark:bg-[#202D25]">

            <p className="text-sm font-medium uppercase tracking-[0.18em] text-[#71856F]">
              New report
            </p>

            <h3 className="mt-2 text-2xl font-semibold">
              Report a campus issue
            </h3>

            <p className="mt-2 text-sm leading-6 text-[#777A72] dark:text-[#AEB9B1]">
              Tell us what happened and where it happened.
            </p>


            <form
              onSubmit={
                handleSubmitIncident
              }
              className="mt-7 space-y-5"
            >

              <div>

                <label className="mb-2 block text-sm font-medium">
                  Issue title
                </label>

                <input
                  type="text"
                  name="title"
                  value={
                    form.title
                  }
                  onChange={
                    handleFormChange
                  }
                  placeholder="e.g. Broken corridor light"
                  required
                  className="w-full rounded-2xl border border-[#D8D2C7] bg-[#F9F6F0] px-4 py-3 text-sm outline-none focus:border-[#71856F] dark:border-[#3A4C40] dark:bg-[#18231D]"
                />

              </div>


              <div>

                <label className="mb-2 block text-sm font-medium">
                  Description
                </label>

                <textarea
                  name="description"
                  value={
                    form.description
                  }
                  onChange={
                    handleFormChange
                  }
                  placeholder="Describe the problem..."
                  rows="4"
                  required
                  className="w-full resize-none rounded-2xl border border-[#D8D2C7] bg-[#F9F6F0] px-4 py-3 text-sm outline-none focus:border-[#71856F] dark:border-[#3A4C40] dark:bg-[#18231D]"
                />

              </div>


              <div>

                <label className="mb-2 block text-sm font-medium">
                  Category
                </label>

                <select
                  name="category"
                  value={
                    form.category
                  }
                  onChange={
                    handleFormChange
                  }
                  className="w-full rounded-2xl border border-[#D8D2C7] bg-[#F9F6F0] px-4 py-3 text-sm outline-none focus:border-[#71856F] dark:border-[#3A4C40] dark:bg-[#18231D]"
                >

                  <option value="safety">
                    Safety
                  </option>

                  <option value="electrical">
                    Electrical
                  </option>

                  <option value="water">
                    Water
                  </option>

                  <option value="infrastructure">
                    Infrastructure
                  </option>

                  <option value="cleanliness">
                    Cleanliness
                  </option>

                  <option value="security">
                    Security
                  </option>

                  <option value="network">
                    Network
                  </option>

                  <option value="hostel">
                    Hostel
                  </option>

                  <option value="classroom">
                    Classroom
                  </option>

                  <option value="other">
                    Other
                  </option>

                </select>

              </div>


              <div>

                <label className="mb-2 block text-sm font-medium">
                  Location
                </label>

                <input
                  type="text"
                  name="location"
                  value={
                    form.location
                  }
                  onChange={
                    handleFormChange
                  }
                  placeholder="e.g. Block B, 2nd floor"
                  required
                  className="w-full rounded-2xl border border-[#D8D2C7] bg-[#F9F6F0] px-4 py-3 text-sm outline-none focus:border-[#71856F] dark:border-[#3A4C40] dark:bg-[#18231D]"
                />

              </div>


              <button
                type="button"
                onClick={
                  getLocation
                }
                className="w-full rounded-2xl border border-[#C9D3C5] bg-[#F3F6EF] px-4 py-3 text-sm font-medium text-[#52664D] dark:border-[#46594D] dark:bg-[#26382E] dark:text-[#B9CBB8]"
              >
                {coordinates
                  ? "✓ Location captured"
                  : "Use my current location"}
              </button>


              <button
                type="submit"
                className="w-full rounded-2xl bg-[#344E41] px-5 py-3.5 font-medium text-white dark:bg-[#71856F]"
              >
                Submit report
              </button>

            </form>

          </div>


          <div className="overflow-hidden rounded-[28px] border border-[#E5DED2] bg-[#FFFDF8] dark:border-[#304238] dark:bg-[#202D25]">

            <div className="border-b border-[#E5DED2] px-7 py-5 dark:border-[#304238]">

              <p className="text-sm font-medium uppercase tracking-[0.18em] text-[#71856F]">
                Campus map
              </p>

              <h3 className="mt-2 text-2xl font-semibold">
                Report locations
              </h3>

            </div>


            <div className="h-[520px]">

              <MapContainer
                center={[
                  15,
                  75,
                ]}
                zoom={5}
                scrollWheelZoom={true}
                className="h-full w-full"
              >

                <TileLayer
                  attribution="&copy; OpenStreetMap contributors"
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <MapViewController
                  incidents={
                    mappedIncidents
                  }
                />


                {mappedIncidents.map(
                  (incident) => (

                    <Marker
                      key={
                        incident.id
                      }
                      position={[
                        incident.latitude,
                        incident.longitude,
                      ]}
                    >

                      <Popup>

                        <div className="min-w-[180px]">

                          <strong>
                            {incident.title}
                          </strong>

                          <p className="mt-1 text-sm">
                            {incident.location}
                          </p>

                          <p className="mt-1 text-xs">
                            Status:{" "}
                            {formatStatus(
                              incident.status
                            )}
                          </p>

                        </div>

                      </Popup>

                    </Marker>

                  )
                )}

              </MapContainer>

            </div>

          </div>

        </section>

        <section className="mt-10">
  <div className="mb-6">
    <p className="text-sm font-medium uppercase tracking-[0.18em] text-[#71856F]">
      Campus updates
    </p>

    <h3 className="mt-2 text-3xl font-semibold">
      Campus incidents
    </h3>

    <p className="mt-2 max-w-2xl text-sm leading-6 text-[#777A72] dark:text-[#AEB9B1]">
      Stay informed about incidents currently reported across campus.
    </p>
  </div>

  {publicIncidents.length === 0 ? (
    <div className="rounded-[28px] border border-[#E5DED2] bg-[#FFFDF8] p-10 text-center dark:border-[#304238] dark:bg-[#202D25]">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E7EBDD] text-2xl dark:bg-[#304238]">
        ✓
      </div>

      <h4 className="mt-4 text-lg font-semibold">
        No campus incidents
      </h4>

      <p className="mt-2 text-sm text-[#777A72] dark:text-[#AEB9B1]">
        There are currently no active campus incidents to display.
      </p>
    </div>
  ) : (
    <div className="space-y-4">
      {publicIncidents.map((incident) => (
        <div
          key={incident.id}
          className="rounded-[28px] border border-[#E5DED2] bg-[#FFFDF8] p-6 shadow-sm dark:border-[#304238] dark:bg-[#202D25]"
        >
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-[#DFE8DC] px-3 py-1.5 text-xs font-medium capitalize text-[#52664D] dark:bg-[#304036] dark:text-[#B8C9B4]">
                  {formatPopupStatus(incident.status)}
                </span>

                <span className="rounded-full bg-[#E9E4D5] px-3 py-1.5 text-xs font-medium capitalize text-[#675E4B] dark:bg-[#3B392F] dark:text-[#D8CFB5]">
                  {incident.priority}
                </span>
              </div>

              <h4 className="mt-4 text-xl font-semibold">
                {incident.title}
              </h4>
              <div className="mt-4 rounded-2xl border border-[#E5DED2] bg-[#F7F3EC] p-4 dark:border-[#304238] dark:bg-[#18231D]">
  <p className="mb-3 text-xs font-medium uppercase tracking-[0.15em] text-[#71856F]">
    Progress
  </p>

  <div className="flex items-center justify-between gap-1">
    {[
      "reported",
      "assigned",
      "in_progress",
      "resolved",
      "closed",
    ].map((step, index, steps) => {
      const currentIndex = steps.indexOf(incident.status)
      const isCompleted = index <= currentIndex
      const isCurrent = index === currentIndex

      return (
        <div
          key={step}
          className="flex flex-1 items-center"
        >
          <div className="flex flex-col items-center">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${
                isCurrent
                  ? "bg-[#71856F] text-white"
                  : isCompleted
                    ? "bg-[#A8B9A2] text-white"
                    : "bg-[#DDD8CD] text-[#777A72] dark:bg-[#344139] dark:text-[#AEB9B1]"
              }`}
            >
              {index + 1}
            </div>

            <span className="mt-2 text-center text-[10px] font-medium capitalize text-[#777A72] dark:text-[#AEB9B1]">
              {formatPopupStatus(step)}
            </span>
          </div>

          {index < steps.length - 1 && (
            <div
              className={`mx-1 h-0.5 flex-1 ${
                index < currentIndex
                  ? "bg-[#A8B9A2]"
                  : "bg-[#DDD8CD] dark:bg-[#344139]"
              }`}
            />
          )}
        </div>
      )
    })}
  </div>
</div>

              <p className="mt-2 text-sm leading-6 text-[#777A72] dark:text-[#AEB9B1]">
                {incident.description}
              </p>

              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm">
                <span>
                  📍 {incident.location}
                </span>

                <span>
                  Category:{" "}
                  <span className="capitalize">
                    {incident.category}
                  </span>
                </span>

                <span>
                  Reported by:{" "}
                  {incident.reported_by?.name || "Unknown"}
                </span>
              </div>

              {incident.assigned_to && (
                <p className="mt-3 text-xs text-[#777A72] dark:text-[#AEB9B1]">
                  Being handled by {incident.assigned_to.name}
                </p>
              )}
              <div className="mt-5">
  <button
    onClick={() => openProgress(incident)}
    className="w-full rounded-2xl border border-[#C8D4C3] bg-[#EDF2E9] px-4 py-3 text-sm font-medium text-[#52664D] transition hover:bg-[#E1E9DD] dark:border-[#3A4C40] dark:bg-[#26382E] dark:text-[#B8C9B4] dark:hover:bg-[#304238]"
  >
    View progress
  </button>
</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )}
</section>

        <section className="mt-10">

          <div className="mb-6">

            <p className="text-sm font-medium uppercase tracking-[0.18em] text-[#71856F]">
              Your reports
            </p>

            <h3 className="mt-2 text-3xl font-semibold">
              My incidents
            </h3>

          </div>


          {loadingIncidents ? (

            <div className="rounded-[28px] border border-[#E5DED2] bg-[#FFFDF8] p-10 text-center dark:border-[#304238] dark:bg-[#202D25]">
              Loading your incidents...
            </div>

          ) : incidents.length === 0 ? (

            <div className="rounded-[28px] border border-[#E5DED2] bg-[#FFFDF8] p-10 text-center dark:border-[#304238] dark:bg-[#202D25]">

              <p className="text-lg font-medium">
                No incidents yet.
              </p>

              <p className="mt-2 text-sm text-[#777A72] dark:text-[#AEB9B1]">
                Your submitted reports will appear here.
              </p>

            </div>

          ) : (

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">

              {incidents.map(
                (incident) => (

                  <article
                    key={
                      incident.id
                    }
                    className="rounded-[26px] border border-[#E5DED2] bg-[#FFFDF8] p-6 dark:border-[#304238] dark:bg-[#202D25]"
                  >

                    <div className="flex flex-wrap gap-2">

                      <span
                        className={`rounded-full px-3 py-1.5 text-xs font-medium ${getStatusStyle(
                          incident.status
                        )}`}
                      >
                        {formatStatus(
                          incident.status
                        )}
                      </span>

                      <span
                        className={`rounded-full px-3 py-1.5 text-xs font-medium ${getPriorityStyle(
                          incident.priority
                        )}`}
                      >
                        {incident.priority}
                      </span>

                    </div>


                    <h4 className="mt-5 text-xl font-semibold">
                      {incident.title}
                    </h4>


                    <p className="mt-2 line-clamp-3 text-sm leading-6 text-[#777A72] dark:text-[#AEB9B1]">
                      {incident.description}
                    </p>


                    <div className="mt-5 space-y-2 text-sm">

                      <p>
                        📍 {incident.location}
                      </p>

                      <p className="text-[#777A72] dark:text-[#AEB9B1]">
                        Reported{" "}
                        {formatDate(
                          incident.created_at
                        )}
                      </p>

                    </div>


                    <button
                      onClick={() =>
                        openProgress(
                          incident
                        )
                      }
                      className="mt-6 w-full rounded-xl border border-[#C9D3C5] bg-[#F3F6EF] px-4 py-3 text-sm font-medium text-[#52664D] dark:border-[#46594D] dark:bg-[#26382E] dark:text-[#B9CBB8]"
                    >
                      View progress →
                    </button>

                  </article>

                )
              )}

            </div>

          )}

        </section>

      </main>


      {selectedIncident && (

        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 px-4 py-8 backdrop-blur-sm">

          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[30px] border border-[#E5DED2] bg-[#FFFDF8] p-7 shadow-2xl dark:border-[#304238] dark:bg-[#202D25]">

            <button
              onClick={
                closeProgress
              }
              className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full bg-[#EDEBE2] text-lg dark:bg-[#304238]"
            >
              ×
            </button>


            <p className="text-sm font-medium uppercase tracking-[0.18em] text-[#71856F]">
              Incident progress
            </p>


            <h3 className="mt-3 pr-10 text-2xl font-semibold">
              {selectedIncident.title}
            </h3>


            <div className="mt-6 rounded-2xl bg-[#F3F1E9] p-5 dark:bg-[#26382E]">

              <p className="text-xs uppercase tracking-wide text-[#777A72] dark:text-[#87948C]">
                Current status
              </p>

              <span
                className={`mt-3 inline-flex rounded-full px-3 py-1.5 text-xs font-medium ${getStatusStyle(
                  selectedIncident.status
                )}`}
              >
                {formatStatus(
                  selectedIncident.status
                )}
              </span>

            </div>


            <h4 className="mt-8 text-lg font-semibold">
              Status history
            </h4>


            {loadingHistory ? (

              <p className="mt-5 text-sm text-[#777A72] dark:text-[#AEB9B1]">
                Loading history...
              </p>

            ) : history.length === 0 ? (

              <p className="mt-5 text-sm text-[#777A72] dark:text-[#AEB9B1]">
                No history available yet.
              </p>

            ) : (

              <div className="mt-6 space-y-5">

                {history.map(
                  (entry, index) => (

                    <div
                      key={
                        entry.id ??
                        index
                      }
                      className="flex gap-4"
                    >

                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#71856F] text-xs text-white">
                        ✓
                      </div>

                      <div>

                        <p className="font-medium">
                          {formatStatus(
                            entry.status
                          )}
                        </p>

                        <p className="mt-1 text-xs text-[#777A72] dark:text-[#87948C]">
                          {formatDateTime(
                            entry.changed_at
                          )}
                        </p>

                      </div>

                    </div>

                  )
                )}

              </div>

            )}


            <div className="mt-10">

              <div className="flex items-center justify-between">

                <h4 className="text-lg font-semibold">
                  Progress updates
                </h4>

                <span className="text-xs text-[#777A72] dark:text-[#87948C]">
                  {incidentComments.length}{" "}
                  update
                  {incidentComments.length ===
                  1
                    ? ""
                    : "s"}
                </span>

              </div>


              {loadingComments ? (

                <p className="mt-5 text-sm text-[#777A72] dark:text-[#AEB9B1]">
                  Loading progress updates...
                </p>

              ) : incidentComments.length ===
                0 ? (

                <div className="mt-5 rounded-2xl border border-dashed border-[#D8D2C7] p-5 text-sm text-[#777A72] dark:border-[#3A4C40] dark:text-[#AEB9B1]">
                  No progress updates from staff yet.
                </div>

              ) : (

                <div className="mt-5 space-y-4">

                  {incidentComments.map(
                    (comment, index) => (

                      <div
                        key={
                          comment.id ??
                          index
                        }
                        className="rounded-2xl bg-[#F3F1E9] p-5 dark:bg-[#26382E]"
                      >

                        <p className="text-sm leading-6">
                          {comment.comment}
                        </p>

                        {comment.created_at && (

                          <p className="mt-3 text-xs text-[#777A72] dark:text-[#87948C]">
                            {formatDateTime(
                              comment.created_at
                            )}
                          </p>

                        )}

                      </div>

                    )
                  )}

                </div>

              )}

            </div>


            <button
              onClick={
                closeProgress
              }
              className="mt-8 rounded-xl bg-[#344E41] px-5 py-2.5 text-sm font-medium text-white dark:bg-[#71856F]"
            >
              Done
            </button>

          </div>

        </div>

      )}

    </div>
  )
}

export default App