import React from "react";
import Header from "./layout/partials/Header";
import HeroSection from "./home/HeroSection";
import Categories from "./home/Categories";
import UpcomingTrainings from "./home/UpcomingTrainings";
import ExploreblogsCompanies from "./home/ExploreblogsCompanies";
import CorporateAndAccreditation from "./home/CorporateAndAccreditation";
import Footer from "./layout/partials/Footer";


function Home() {
  return (
    <div>
      <Header />
      <HeroSection />
      <Categories />
      <UpcomingTrainings />
      <ExploreblogsCompanies />
      <CorporateAndAccreditation />
      <Footer />
    </div>
  );
}

export default Home;
