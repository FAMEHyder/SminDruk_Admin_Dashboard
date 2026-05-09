"use client";

import {
  Typography,
  Container,
  Box,
  TextField,
  Button,
  Grid,
} from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import ScheduleIcon from "@mui/icons-material/Schedule";
import { useFormik } from "formik";
import * as Yup from "yup";
import emailjs from "@emailjs/browser";

const ContactUs = () => {
  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      message: "",
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Name is required"),
      email: Yup.string()
        .email("Invalid email address")
        .required("Email is required"),
      message: Yup.string().required("Message is required"),
    }),
    onSubmit: (values, { resetForm }) => {
      emailjs
        .send(
          "service_bko45nn",
          "template_kuu4qem",
          {
            to_name: "SDMC",
            from_name: values.name,
            from_email: values.email,
            message: values.message,
          },
          "Gpm47Cw5Xb3Vf2MI3"
        )
        .then(() => {
          alert("Message sent successfully!");
          resetForm();
        })
        .catch(() => {
          alert("Failed to send the message, please try again.");
        });
    },
  });

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100vh",
        backgroundImage: `linear-gradient(rgba(0,0,0,.1)), url('/com.png')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        alignItems: "center",
        py: 6,
      }}  
    >
      <Container maxWidth="lg"
        sx={{
          background: "linear-gradient(rgba(26, 87, 74, 0.5), rgba(26, 87, 74, 0.5))",
          height: 500,
          backdropFilter: "blur(4px)",
          WebkitBackdropFilter: "blur(5px)", 
        }}

      >

        <Typography
          align="center"
          color="white"
          fontSize={{ xs: 26, md: 34 }}
          fontWeight={700}
          mb={5}
        >
          Contact Us
        </Typography>


        <Grid container spacing={6} justifyContent="center">

          <Grid item xs={12} md={5}>
            <InfoItem
              icon={<LocationOnIcon sx={{ color: "#187975ff" }} />}
              title="Address"
              text="SAT-TARA DIGITAL MARKETING SERVER"
            />

            <InfoItem
              icon={<PhoneIcon sx={{ color: "#187975ff" }} />}
              title="Phone"
              text="+923417405991 | +923554526991"
            />

            <InfoItem
              icon={<EmailIcon sx={{ color: "#187975ff" }} />}
              title="Email"
              text="SAT-TARA DIGITAL MARKETING SERVER"
            />

            <InfoItem
              icon={<ScheduleIcon sx={{ color: "#187975ff" }} />}
              title="Services"
              text="24/7"
            />
          </Grid>

          <Grid item xs={12} md={5}>
            <Box
              component="form"
              onSubmit={formik.handleSubmit}
              sx={{
                bgcolor: "white",
                borderRadius: 1,
                p: 4,
                boxShadow: "0px 10px 25px rgba(0,0,0,.35)",
              }}
            >
              <Typography fontWeight={700} mb={2}>
                Send Message
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    id="name"
                    name="name"
                    label="Full Name"
                    value={formik.values.name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.name && Boolean(formik.errors.name)}
                    helperText={formik.touched.name && formik.errors.name}
                    size="small"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    id="email"
                    name="email"
                    label="Email"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.email && Boolean(formik.errors.email)}
                    helperText={formik.touched.email && formik.errors.email}
                    size="small"
                  />
                </Grid>
              </Grid>

              <TextField
                fullWidth
                id="message"
                name="message"
                label="Type your Message..."
                multiline
                rows={4}
                value={formik.values.message}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.message && Boolean(formik.errors.message)}
                helperText={formik.touched.message && formik.errors.message}
                sx={{ mt: 2 }}
              />

              <Button
                type="submit"
                variant="contained"
                fullWidth
                sx={{
                  mt: 2,
                  bgcolor: "#187975ff",
                  py: 1.2,
                  "&:hover": { bgcolor: "#127676ff" },
                }}
              >
                Send
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

const InfoItem = ({ icon, title, text }) => (
  <Box display="flex" alignItems="center" mb={4}>
    <Box
      sx={{
        bgcolor: "white",
        width: 55,
        height: 55,
        borderRadius: "50%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        mr: 2,
      }}
    >
      {icon}
    </Box>

    <Box color="white">
      <Typography fontWeight={700}>{title}</Typography>
      <Typography sx={{ opacity: 0.8 }}>{text}</Typography>
    </Box>
  </Box>
);

export default ContactUs;
