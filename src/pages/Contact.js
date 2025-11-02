import React, { useState } from 'react';
import { styled } from '@mui/material/styles';
import { Box, Typography, Button } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import Header from '../app/layout/Header';

const Section = styled(Box)(({ theme }) => ({
    padding: '4rem 0',
    marginTop: '80px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    [theme.breakpoints.down('sm')]: {
        padding: '2rem 0',
        marginTop: '60px',
    },
}));

const ContentWrapper = styled(Box)(({ theme }) => ({
    backgroundColor: '#f7f7f7',
    border: '1px solid #ddd',
    borderRadius: '20px',
    padding: theme.spacing(5),
    maxWidth: '600px',
    width: '100%',
    boxShadow: '0 8px 30px rgba(0,0,0,0.1)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
    fontSize: '2.5rem',
    fontWeight: 800,
    textAlign: 'center',
    marginBottom: '2rem',
    color: '#000',
}));

const Label = styled('label')({
    fontWeight: 600,
    fontSize: '1rem',
    marginBottom: '8px',
    color: '#000',
    display: 'block',
});

const Input = styled('input')({
    width: '100%',
    padding: '12px 16px',
    fontSize: '1rem',
    border: '1px solid #ddd',
    borderRadius: '8px',
    marginBottom: '20px',
    outline: 'none',
    backgroundColor: '#fff',
    color: '#000',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    transition: 'all 0.3s ease-in-out',
    '&:focus': {
        borderColor: '#4d0b8c',
        boxShadow: '0 0 8px rgba(77, 11, 140, 0.2)',
    },
});

const Textarea = styled('textarea')({
    width: '100%',
    padding: '12px 16px',
    fontSize: '1rem',
    border: '1px solid #ddd',
    borderRadius: '8px',
    minHeight: '140px',
    resize: 'vertical',
    outline: 'none',
    backgroundColor: '#fff',
    color: '#000',
    marginBottom: '20px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    transition: 'all 0.3s ease-in-out',
    '&:focus': {
        borderColor: '#4d0b8c',
        boxShadow: '0 0 8px rgba(77, 11, 140, 0.2)',
    },
});

const SubmitButton = styled(Button)(({ theme }) => ({
    backgroundColor: '#000',
    color: '#fff',
    padding: '12px 24px',
    borderRadius: '25px',
    fontWeight: 600,
    fontSize: '1rem',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
    transition: 'all 0.3s ease-in-out',
    '&:hover': {
        backgroundColor: '#333',
        transform: 'translateY(-2px)',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4)',
    },
    '&:active': {
        backgroundColor: '#111',
        transform: 'translateY(0)',
    },
}));

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const { name, email, subject, message } = formData;

        if (!name || !email || !subject || !message) {
            alert('Please fill in all fields');
            return;
        }

        if (!email.includes('@')) {
            alert('Please enter a valid email');
            return;
        }

        console.log('Form submitted:', formData);
        setFormData({
            name: '',
            email: '',
            subject: '',
            message: '',
        });
    };

    return (
        <Box sx={{ bgcolor: '#fff', width: '100%' }}>
            <Header />
            <Section>
                <SectionTitle>Contact Us</SectionTitle>
                <ContentWrapper>
                    <form onSubmit={handleSubmit}>
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />

                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />

                        <Label htmlFor="subject">Subject</Label>
                        <Input
                            id="subject"
                            name="subject"
                            value={formData.subject}
                            onChange={handleChange}
                            required
                        />

                        <Label htmlFor="message">Message</Label>
                        <Textarea
                            id="message"
                            name="message"
                            value={formData.message}
                            onChange={handleChange}
                            required
                        />

                        <SubmitButton
                            type="submit"
                            variant="contained"
                            endIcon={<SendIcon />}
                            fullWidth
                        >
                            Send Message
                        </SubmitButton>
                    </form>
                </ContentWrapper>
            </Section>
        </Box>
    );
};

export default Contact;
