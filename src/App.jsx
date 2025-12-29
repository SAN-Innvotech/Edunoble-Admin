import "./styles/index.scss";

import "@fortawesome/fontawesome-svg-core/styles.css";
import "react-calendar/dist/Calendar.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import AOS from "aos";
import "aos/dist/aos.css";
import { useEffect } from "react";
import Context from "@/context/Context";
import HomePage1 from "./pages";
import HomePage2 from "./pages/homes/home-2";
import HomePage3 from "./pages/homes/home-3";
import HomePage4 from "./pages/homes/home-4";
import HomePage5 from "./pages/homes/home-5";
import HomePage6 from "./pages/homes/home-6";
import HomePage7 from "./pages/homes/home-7";
import HomePage8 from "./pages/homes/home-8";
import HomePage9 from "./pages/homes/home-9";
import HomePage10 from "./pages/homes/home-10";
import CourseListPage1 from "./pages/coursesList/courses-list-1";
import CourseListPage2 from "./pages/coursesList/courses-list-2";
import CourseListPage3 from "./pages/coursesList/courses-list-3";
import CourseListPage4 from "./pages/coursesList/courses-list-4";
import CourseListPage5 from "./pages/coursesList/courses-list-5";
import CourseListPage6 from "./pages/coursesList/courses-list-6";
import CourseListPage7 from "./pages/coursesList/courses-list-7";
import CourseListPage8 from "./pages/coursesList/courses-list-8";
import CourseSinglePage1 from "./pages/courseSingle/courses";
import CourseSinglePage2 from "./pages/courseSingle/courses-single-2";
import CourseSinglePage3 from "./pages/courseSingle/courses-single-3";
import CourseSinglePage4 from "./pages/courseSingle/courses-single-4";
import CourseSinglePage5 from "./pages/courseSingle/courses-single-5";
import CourseCartPage from "./pages/cartPages/course-cart";
import CourseCheckoutPage from "./pages/cartPages/course-checkout";
import LessonSinglePage1 from "./pages/aboutCourses/lesson-single-1";
import LessonSinglePage2 from "./pages/aboutCourses/lesson-single-2";
import InstractorListPage1 from "./pages/aboutCourses/instructors-list-1";
import InstractorListPage2 from "./pages/aboutCourses/instructors-list-2";
import InstractorSinglePage from "./pages/aboutCourses/instructors";
import InstractoBacomePage from "./pages/aboutCourses/instructor-become";
import DashboardPage from "./pages/dashboard/dashboard";
import DshbCoursesPage from "./pages/dashboard/dshb-courses";
import DshbBookmarksPage from "./pages/dashboard/dshb-bookmarks";
import DshbListingPage from "./pages/dashboard/dshb-listing";
import DshbReviewsPage from "./pages/dashboard/dshb-reviews";
import DshbSettingsPage from "./pages/dashboard/dshb-settings";
import DshbAdministrationPage from "./pages/dashboard/dshb-administration";
import DshbAssignmentPage from "./pages/dashboard/dshb-assignment";
import DshbCalenderPage from "./pages/dashboard/dshb-calendar";
import DshbDashboardPage from "./pages/dashboard/dshb-dashboard";
import DshbDictionaryPage from "./pages/dashboard/dshb-dictionary";
import DshbForumsPage from "./pages/dashboard/dshb-forums";
import DshbGradesPage from "./pages/dashboard/dshb-grades";
import DshbMessagesPage from "./pages/dashboard/dshb-messages";
import DshbPartcipentPage from "./pages/dashboard/dshb-participants";
import DshbQuizPage from "./pages/dashboard/dshb-quiz";
import DshbServeyPage from "./pages/dashboard/dshb-survey";
import EventListPage1 from "./pages/events/event-list-1";
import EventSingPage from "./pages/events/events";
import EventCartPage from "./pages/cartPages/event-cart";
import EventCheckoutPage from "./pages/cartPages/event-checkout";
import BlogListpage1 from "./pages/blogs/blog-list-1";
import BlogListpage2 from "./pages/blogs/blog-list-2";
import BlogListpage3 from "./pages/blogs/blog-list-3";
import BlogdetailsPage from "./pages/blogs/blogs";
import AboutPage1 from "./pages/about/about-1";
import AboutPage2 from "./pages/about/about-2";
import ContactPage1 from "./pages/contacts/contact-1";
import ContactPage2 from "./pages/contacts/contact-2";
import ShopCartPage from "./pages/cartPages/shop-cart";
import ShopCheckoutPage from "./pages/cartPages/shop-checkout";
import ShopListPage from "./pages/shop/shop-list";
import ShopOrderPage from "./pages/shop/shop-order/page";
import ShopdetailsPage from "./pages/shop/shop";
import PricingPage from "./pages/others/pricing";

import TermsPage from "./pages/others/terms";
import HelpCenterPage from "./pages/others/help-center";
import LoginPage from "./pages/others/login";
import SignupPage from "./pages/others/signup";
import UIElementsPage from "./pages/others/ui-elements";
import EventListPage2 from "./pages/events/event-list-2";
import CourseSinglePage6 from "./pages/courseSingle/courses-single-6/page";
import ScrollTopBehaviour from "./components/common/ScrollTopBehaviour";
import NotFoundPage from "./pages/not-found";

function App() {
  useEffect(() => {
    AOS.init({
      duration: 700,
      offset: 120,
      easing: "ease-out",
      once: true,
    });
  }, []);

  return (
    <>
      <Context>
        <BrowserRouter>
          <Routes>
            <Route path="/">
              <Route index element={<HomePage1 />} />
              {/* <Route path="home-1" element={<HomePage1 />} /> */}
              {/* <Route path="home-2" element={<HomePage2 />} /> */}
              {/* <Route path="home-3" element={<HomePage3 />} /> */}
              {/* <Route path="home-4" element={<HomePage4 />} /> */}
              {/* <Route path="home-5" element={<HomePage5 />} /> */}
              {/* <Route path="home-6" element={<HomePage6 />} /> */}
              {/* <Route path="home-7" element={<HomePage7 />} /> */}
              {/* <Route path="home-8" element={<HomePage8 />} /> */}
              {/* <Route path="home-9" element={<HomePage9 />} /> */}
              {/* <Route path="home-10" element={<HomePage10 />} /> */}

              {/* <Route path="courses-list-1" element={<CourseListPage1 />} /> */}
              {/* <Route path="courses-list-2" element={<CourseListPage2 />} /> */}
              <Route path="papers" element={<CourseListPage3 />} />
              {/* <Route path="courses-list-4" element={<CourseListPage4 />} /> */}
              {/* <Route path="courses-list-5" element={<CourseListPage5 />} /> */}
              {/* <Route path="courses-list-6" element={<CourseListPage6 />} /> */}
              {/* <Route path="courses-list-7" element={<CourseListPage7 />} /> */}
              {/* <Route path="courses-list-8" element={<CourseListPage8 />} /> */}

              {/* <Route path="courses/:id" element={<CourseSinglePage1 />} /> */}
              {/* <Route
                path="courses-single-2/:id"
                element={<CourseSinglePage2 />}
              />
              <Route
                path="courses-single-3/:id"
                element={<CourseSinglePage3 />}
              />
              <Route
                path="courses-single-4/:id"
                element={<CourseSinglePage4 />}
              />
              <Route
                path="courses-single-5/:id"
                element={<CourseSinglePage5 />}
              />
              <Route
                path="courses-single-6/:id"
                element={<CourseSinglePage6 />}
              /> */}

              {/* <Route path="course-cart" element={<CourseCartPage />} /> */}
              {/* <Route path="course-checkout" element={<CourseCheckoutPage />} /> */}
              {/* <Route path='courses-single-5/:id' element={<CourseSinglePage6 />} /> */}

              {/* <Route path="lesson-single-1" element={<LessonSinglePage1 />} /> */}
              {/* <Route path="lesson-single-2" element={<LessonSinglePage2 />} /> */}

              {/* <Route
                path="instructors-list-1"
                element={<InstractorListPage1 />}
              /> */}
              {/* <Route
                path="instructors-list-2"
                element={<InstractorListPage2 />}
              /> */}

              {/* <Route
                path="instructors/:id"
                element={<InstractorSinglePage />}
              /> */}

              {/* <Route
                path="instructor-become"
                element={<InstractoBacomePage />}
              /> */}

              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="dshb-courses" element={<DshbCoursesPage />} />
              {/* <Route path="dshb-bookmarks" element={<DshbBookmarksPage />} /> */}
              <Route path="dshb-listing" element={<DshbListingPage />} />
              <Route path="dshb-reviews" element={<DshbReviewsPage />} />
              {/* <Route path="dshb-settings" element={<DshbSettingsPage />} /> */}
              {/* <Route
                path="dshb-administration"
                element={<DshbAdministrationPage />}
              /> */}
              {/* <Route path="dshb-assignment" element={<DshbAssignmentPage />} /> */}
              {/* <Route path="dshb-calendar" element={<DshbCalenderPage />} /> */}
              {/* <Route path="dshb-dashboard" element={<DshbDashboardPage />} /> */}
              {/* <Route path="dshb-dictionary" element={<DshbDictionaryPage />} /> */}
              {/* <Route path="dshb-forums" element={<DshbForumsPage />} /> */}
              {/* <Route path="dshb-grades" element={<DshbGradesPage />} /> */}
              {/* <Route path="dshb-messages" element={<DshbMessagesPage />} /> */}
              {/* <Route
                path="dshb-participants"
                element={<DshbPartcipentPage />}
              /> */}
              {/* <Route path="dshb-quiz" element={<DshbQuizPage />} /> */}
              {/* <Route path="dshb-survey" element={<DshbServeyPage />} /> */}

              {/* <Route path="event-list-1" element={<EventListPage1 />} /> */}
              {/* <Route path="event-list-2" element={<EventListPage2 />} /> */}
              {/* <Route path="events/:id" element={<EventSingPage />} /> */}
              {/* <Route path="event-cart" element={<EventCartPage />} /> */}
              {/* <Route path="event-checkout" element={<EventCheckoutPage />} /> */}

              {/* <Route path="blog-list-1" element={<BlogListpage1 />} /> */}
              {/* <Route path="blog-list-2" element={<BlogListpage2 />} /> */}
              {/* <Route path="blog-list-3" element={<BlogListpage3 />} /> */}
              {/* <Route path="blogs/:id" element={<BlogdetailsPage />} /> */}

              {/* <Route path="about-1" element={<AboutPage1 />} /> */}
              {/* <Route path="about-2" element={<AboutPage2 />} /> */}

              <Route path="contact-1" element={<ContactPage1 />} />
              {/* <Route path="contact-2" element={<ContactPage2 />} /> */}

              {/* <Route path="shop-cart" element={<ShopCartPage />} /> */}
              {/* <Route path="shop-checkout" element={<ShopCheckoutPage />} /> */}
              {/* <Route path="shop-list" element={<ShopListPage />} /> */}
              {/* <Route path="shop-order" element={<ShopOrderPage />} /> */}
              {/* <Route path="shop/:id" element={<ShopdetailsPage />} /> */}

              {/* <Route path="pricing" element={<PricingPage />} /> */}
              {/* <Route path="not-found" element={<NotFoundPage />} /> */}
              <Route path="*" element={<NotFoundPage />} />
              {/* <Route path="terms" element={<TermsPage />} /> */}
              {/* <Route path="help-center" element={<HelpCenterPage />} /> */}
              <Route path="login" element={<LoginPage />} />
              {/* <Route path="signup" element={<SignupPage />} /> */}
              <Route path="ui-elements" element={<UIElementsPage />} />
            </Route>
          </Routes>
          <ScrollTopBehaviour />
        </BrowserRouter>
      </Context>
    </>
  );
}

export default App;
