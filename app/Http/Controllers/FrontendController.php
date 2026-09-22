<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Project;
use App\Models\Capability;
use App\Models\Article;
use Throwable;

class FrontendController extends Controller
{
    /**
     * Render Tamish Pratap Singh's developer portfolio homepage.
     */
    public function home()
    {
        $defaultProjects = collect([
            (object)[
                'id' => 1,
                'number' => '01',
                'slug' => 'erp-management-system',
                'title' => 'ERP Management System',
                'category' => 'Featured Full-Stack ERP',
                'year' => '2026',
                'technologies' => 'Laravel / PHP / MySQL / JavaScript / jQuery / Bootstrap',
                'short_description' => 'Full-stack ERP management system built with Laravel, PHP and MySQL, featuring business operations, inventory, sales, purchases, accounting, staff management, manufacturing and reporting workflows.',
                'image_url' => 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1600&auto=format&fit=crop',
                'cta' => 'ERP Frontend (tamishpratap.freedev.app/ERP)',
            ],
            (object)[
                'id' => 2,
                'number' => '02',
                'slug' => 'laravel-web-applications',
                'title' => 'Laravel Web Applications',
                'category' => 'Backend MVC (80%)',
                'year' => '2026',
                'technologies' => 'Laravel / PHP / MySQL / Blade / Eloquent',
                'short_description' => 'Clean MVC architecture, routing, Eloquent models, and Blade templates for maintainable web systems.',
                'image_url' => 'https://images.unsplash.com/photo-1639322537228-f710d846310a?q=80&w=1600&auto=format&fit=crop',
                'cta' => 'Explore Laravel Skills',
            ],
            (object)[
                'id' => 3,
                'number' => '03',
                'slug' => 'admin-dashboards',
                'title' => 'Admin Dashboards',
                'category' => 'Management UI (PHP 85%)',
                'year' => '2026',
                'technologies' => 'PHP / MySQL / jQuery / AJAX / Bootstrap',
                'short_description' => 'Dynamic management panels with authenticated access, structured data tables, forms, and CRUD operations.',
                'image_url' => 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?q=80&w=1600&auto=format&fit=crop',
                'cta' => 'Explore Backend Skills',
            ],
            (object)[
                'id' => 4,
                'number' => '04',
                'slug' => 'responsive-web-interfaces',
                'title' => 'Responsive Web Interfaces',
                'category' => 'Responsive UI (CSS 90%)',
                'year' => '2026',
                'technologies' => 'HTML 100% / CSS 90% / JavaScript / Responsive UI',
                'short_description' => 'Accessible, cross-browser responsive interfaces using modern CSS layouts, Flexbox, Grid, and jQuery.',
                'image_url' => 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=1600&auto=format&fit=crop',
                'cta' => 'Explore Frontend UI',
            ],
            (object)[
                'id' => 5,
                'number' => '05',
                'slug' => 'ai-prompt-workflows',
                'title' => 'AI Prompt Engineering Workflows',
                'category' => 'AI Workflows (Pro Skill)',
                'year' => '2026',
                'technologies' => 'AI Prompt Engineering / Automated Code & Architecture',
                'short_description' => 'Leveraging modern AI prompt workflows to accelerate code architecture, debugging, and solution design.',
                'image_url' => 'https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=1600&auto=format&fit=crop',
                'cta' => 'Connect on AI',
            ],
        ]);

        $defaultCapabilities = collect([
            (object)[
                'number' => '01',
                'title' => 'Laravel Development (80%)',
                'description' => 'Building and maintaining MVC web applications with Laravel, structured routing, controllers, Eloquent ORM relationships, Blade templating, authentication modules, and CRUD operations.',
                'focus_areas' => ['Laravel Framework', 'PHP 85%', 'MySQL', 'Eloquent ORM', 'Blade Templates', 'Authentication', 'CRUD Operations'],
                'sort_order' => 1,
            ],
            (object)[
                'number' => '02',
                'title' => 'PHP Backend (85%)',
                'description' => 'Object-oriented PHP programming, server-side data processing, form handling, session management, database operations, and robust application logic.',
                'focus_areas' => ['OOP PHP', 'Server-Side Processing', 'Form Handling', 'Session Management', 'MySQL Queries', 'REST APIs'],
                'sort_order' => 2,
            ],
            (object)[
                'number' => '03',
                'title' => 'HTML & CSS UI (100% / 90%)',
                'description' => 'Semantic HTML5 structure and pixel-perfect CSS styling with Flexbox, CSS Grid, responsive media queries, and clean visual layouts.',
                'focus_areas' => ['HTML5 100%', 'CSS3 90%', 'Responsive Design', 'Flexbox & Grid', 'Cross-Browser', 'Clean Layouts'],
                'sort_order' => 3,
            ],
            (object)[
                'number' => '04',
                'title' => 'JavaScript & jQuery (60% / 80%)',
                'description' => 'Dynamic DOM manipulation, event handling, AJAX asynchronous data requests, interactive UI components, dashboards, and modern user experiences.',
                'focus_areas' => ['jQuery 80%', 'JavaScript 60%', 'DOM Manipulation', 'AJAX Data Requests', 'Interactive UI', 'Dashboards'],
                'sort_order' => 4,
            ],
            (object)[
                'number' => '05',
                'title' => 'AI Prompt Engineering (Pro Skill)',
                'description' => 'Leveraging modern AI prompt workflows to accelerate code architecture, debugging, workflow optimization, solution design, and creative problem solving.',
                'focus_areas' => ['AI Prompt Engineering', 'Workflow Acceleration', 'Code Architecture', 'Debugging', 'Solution Design', 'AI Workflows'],
                'sort_order' => 5,
            ],
        ]);

        try {
            $projects = Project::orderBy('sort_order', 'asc')->get();
            $capabilities = Capability::orderBy('sort_order', 'asc')->get();
            $articles = Article::latest()->get();
        } catch (Throwable $e) {
            $projects = $defaultProjects;
            $capabilities = $defaultCapabilities;
            $articles = collect();
        }

        if ($projects->isEmpty()) {
            $projects = $defaultProjects;
        }

        if ($capabilities->isEmpty()) {
            $capabilities = $defaultCapabilities;
        }

        if ($articles->isEmpty()) {
            $articles = collect([
                (object)[
                    'published_date' => 'August 12, 2026',
                    'title' => 'ERP Management System Demo',
                    'category' => 'Featured Full-Stack Project',
                    'excerpt' => 'Full-stack ERP system built with Laravel, PHP and MySQL covering inventory, sales, purchases, accounting, and staff management.',
                    'image_url' => 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1600&auto=format&fit=crop',
                ],
                (object)[
                    'published_date' => 'August 11, 2026',
                    'title' => 'Laravel & PHP Backend Architecture',
                    'category' => 'Backend Engineering',
                    'excerpt' => 'Structuring clean MVC applications with Laravel, Eloquent ORM, Blade templates, and secure authentication.',
                    'image_url' => 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1600&auto=format&fit=crop',
                ],
                (object)[
                    'published_date' => 'August 10, 2026',
                    'title' => 'AI Prompt Engineering Workflows',
                    'category' => 'AI Prompt Workflow',
                    'excerpt' => 'Leveraging professional AI prompt engineering to accelerate web development, debugging, and solution design.',
                    'image_url' => 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1600&auto=format&fit=crop',
                ],
            ]);
        }

        $profile = [
            'intro' => "Tamish Pratap Singh",
            'hero_lines' => ['BUILDING MODERN', 'WEB EXPERIENCES.'],
            'hero_description' => 'Web Developer with 1 year of professional working experience, building and maintaining responsive web applications using Laravel, PHP, HTML, CSS, JavaScript and jQuery, with active practice in AI prompt engineering.',
            'hero_support' => 'Specializing in Laravel MVC backend architecture, responsive CSS/HTML interfaces, MySQL databases, and AI-assisted prompt workflows.',
            'hero_closing' => '1 Year Experience • Laravel & PHP Developer',
            'personal_statement' => '1 year of professional working experience as a Web Developer, contributing to the development and maintenance of web applications using Laravel, PHP, HTML, CSS, JavaScript and jQuery.',
            'availability' => 'Available for Laravel development, web projects, AI prompt engineering & collaborations.',
        ];

        $highlightCards = [
            [
                'title' => 'Laravel Framework',
                'description' => '80% Proficiency — Building & maintaining MVC web applications with Laravel, structured routing, controllers, Eloquent ORM, Blade templating, and CRUD operations.',
            ],
            [
                'title' => 'PHP Backend',
                'description' => '85% Proficiency — Object-oriented PHP programming, server-side data processing, form handling, session management, and robust application logic.',
            ],
            [
                'title' => 'HTML & CSS UI',
                'description' => 'HTML 100% / CSS 90% — Semantic HTML5 structure and pixel-perfect CSS styling with Flexbox, CSS Grid, responsive media queries, and clean visual layouts.',
            ],
        ];

        $about = [
            'label' => '02 / About Tamish',
            'index' => '02',
            'statement' => [
                [['text' => 'Laravel.', 'emphasis' => true], ['text' => ' PHP', 'emphasis' => false, 'mobileBreak' => true]],
                [['text' => 'Developer.', 'emphasis' => true], ['text' => ' AI Prompt', 'emphasis' => false, 'mobileBreak' => true]],
                [['text' => 'Engineer.', 'emphasis' => true]],
            ],
            'body' => 'Web Developer with 1 year of professional working experience, building and maintaining responsive web applications using Laravel, PHP, HTML, CSS, JavaScript and jQuery.',
            'main_content' => [
                '1 year of professional working experience as a Web Developer, contributing to the development and maintenance of web applications using Laravel, PHP, HTML, CSS, JavaScript and jQuery.',
                'Responsibilities included backend logic, responsive interfaces, database CRUD features, bug fixing, authentication, dashboards, and AI-assisted development workflows.',
                'Academic Education: B.Sc. from Raja Mahendra Pratap Singh State University, Aligarh. 12th UP Board (2023) - 60% Marks, 10th UP Board (2021) - 75% Marks.',
            ],
            'philosophy' => [
                'heading' => 'Developer Skill Proficiency',
                'questions' => [
                    'HTML Development — 100%',
                    'CSS & Responsive UI — 90%',
                    'PHP Development — 85%',
                    'Laravel Framework — 80%',
                    'jQuery — 80%',
                    'JavaScript — 60%',
                    'AI Prompt Engineering — Pro Skill',
                ],
                'closing' => 'Applied across 1 year of active professional web development and AI-assisted workflows.',
            ],
            'values' => [
                ['number' => '01', 'title' => 'Professional Experience', 'description' => '1 year of professional working experience building & maintaining Laravel & PHP applications.'],
                ['number' => '02', 'title' => 'Laravel & PHP Backend', 'description' => 'Advanced proficiency in PHP (85%) and Laravel (80%) MVC architecture & database operations.'],
                ['number' => '03', 'title' => 'HTML & CSS Craft', 'description' => 'Pixel-perfect responsive frontend UI with HTML (100%) and CSS (90%).'],
                ['number' => '04', 'title' => 'AI Prompt Engineering', 'description' => 'Leveraging professional AI prompt workflows for accelerated coding and solution design.'],
            ],
            'current_focus' => 'Laravel applications, PHP development, full-stack ERP management systems, MySQL database modeling, responsive UI design, jQuery, AJAX, and AI prompt engineering.',
            'closing' => ['1 Year Experience.', 'Laravel Developer.', 'AI Prompt Engineer.'],
        ];

        $processSteps = [
            ['number' => '01', 'title' => 'Analyze', 'description' => 'Understand application logic, database schemas, and user requirement flows.'],
            ['number' => '02', 'title' => 'Structure', 'description' => 'Design clean MVC routing, Eloquent models, controllers, and Blade templates.'],
            ['number' => '03', 'title' => 'Develop', 'description' => 'Build robust PHP & Laravel backend features with HTML, CSS, JavaScript & jQuery.'],
            ['number' => '04', 'title' => 'Optimize', 'description' => 'Leverage AI prompt engineering for rapid debugging, refactoring, and code optimization.'],
            ['number' => '05', 'title' => 'Test', 'description' => 'Verify CRUD operations, responsive UI layouts, and form validations.'],
            ['number' => '06', 'title' => 'Deploy', 'description' => 'Deliver scalable, production-ready web applications.'],
        ];

        $contact = [
            'label' => "05 / Let's Connect",
            'location' => "Let's Collaborate",
            'timezone' => 'IST / UTC+05:30 (Aligarh, India)',
            'availability' => 'Currently available for Web & Laravel Development, Freelance & AI Prompt Engineering.',
            'cta' => ["Let's Build Something", "Great Together"],
            'email' => 'tamishpratap.singh@freedev.app',
            'descriptor' => 'Laravel Development / PHP Backend / AI Prompt Engineering',
            'intro' => "Have a project idea, development requirement or collaboration opportunity? Let's connect and build something useful together.",
            'support' => 'Open to web development, Laravel projects, PHP bug fixing, frontend UI, and AI prompt workflows.',
            'final' => "Whether it is full-stack ERP systems, Laravel web apps, or AI prompt engineering, let's build something worth using.",
            'socials' => [
                ['label' => 'Website', 'url' => 'https://tamishpratap.freedev.app'],
                ['label' => 'ERP Demo', 'url' => 'https://tamishpratap.freedev.app/ERP'],
                ['label' => 'Admin Console', 'url' => 'https://tamishpratap.freedev.app/ERP/admin'],
                ['label' => 'Email', 'url' => 'mailto:tamishpratap.singh@freedev.app'],
            ],
        ];

        $collaborationOptions = [
            'Web Development',
            'Laravel Development',
            'PHP Development',
            'Frontend Development',
            'Website Design',
            'Bug Fixing / Maintenance',
            'AI Prompt Engineering',
            'Freelance / Collaboration',
        ];

        $experimentalNotes = [
            'Laravel ERP Modules',
            'PHP MVC Architecture',
            'Responsive CSS Layouts',
            'jQuery AJAX Features',
            'AI Prompt Engineering',
            'MySQL Database Queries',
        ];

        return view('frontend.home', compact(
            'projects',
            'capabilities',
            'articles',
            'profile',
            'highlightCards',
            'about',
            'processSteps',
            'contact',
            'collaborationOptions',
            'experimentalNotes'
        ));
    }
}
