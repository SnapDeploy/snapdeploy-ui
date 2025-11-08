import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  GitBranch,
  Star,
  GitFork,
  Eye,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Check,
  Rocket,
  Database,
} from "lucide-react";
import { useCurrentUser, useUserRepositories } from "@/hooks/useApiQueries";
import { useCreateProject } from "@/hooks/useProjectMutations";
import type { Repository } from "@/lib/api/generated/service";
import type { Language } from "@/types";

const STEPS = [
  {
    id: 1,
    name: "Select Repository",
    description: "Choose a repository to deploy",
  },
  { id: 2, name: "Configure", description: "Set deployment options" },
];

const LANGUAGES = [
  { value: "NODE", label: "Node.js" },
  { value: "NODE_TS", label: "Node.js + TypeScript" },
  { value: "NEXTJS", label: "Next.js" },
  { value: "GO", label: "Go" },
  { value: "PYTHON", label: "Python" },
] as const;

export function CreateProjectPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedRepository, setSelectedRepository] =
    useState<Repository | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;

  // Form state
  const [installCommand, setInstallCommand] = useState("");
  const [buildCommand, setBuildCommand] = useState("");
  const [runCommand, setRunCommand] = useState("");
  const [language, setLanguage] = useState<string>("");
  const [customDomain, setCustomDomain] = useState("");
  const [requireDB, setRequireDB] = useState(false);
  const [migrationCommand, setMigrationCommand] = useState("");

  const { data: user } = useCurrentUser();
  const createProject = useCreateProject(user?.id || "");

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setCurrentPage(1); // Reset to first page on new search
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Pre-fill form when language changes
  useEffect(() => {
    if (!language) return;

    switch (language) {
      case "NODE":
        setInstallCommand("npm install");
        setBuildCommand("npm run build");
        setRunCommand("npm start");
        break;
      case "NODE_TS":
        setInstallCommand("npm install");
        setBuildCommand("npm run build");
        setRunCommand("npm start");
        break;
      case "NEXTJS":
        setInstallCommand("npm install");
        setBuildCommand("npm run build");
        setRunCommand("npm start");
        break;
      case "GO":
        setInstallCommand("go mod download");
        setBuildCommand("go build -o app");
        setRunCommand("./app");
        break;
      case "PYTHON":
        setInstallCommand("pip install -r requirements.txt");
        setBuildCommand("python -m build");
        setRunCommand("python main.py");
        break;
    }
  }, [language]);

  const { data, isLoading, error } = useUserRepositories(user?.id, {
    page: currentPage,
    limit,
    search: debouncedSearch || undefined,
  });

  const repositories = data?.repositories || [];
  const pagination = data?.pagination;

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
  };

  const handleRepositorySelect = (repo: Repository) => {
    setSelectedRepository(repo);
    // Auto-detect language from repository if possible
    if (repo.language) {
      const lang = repo.language.toUpperCase();
      if (lang === "JAVASCRIPT" || lang === "TYPESCRIPT") {
        setLanguage("NODE_TS");
      } else if (lang === "GO") {
        setLanguage("GO");
      } else if (lang === "PYTHON") {
        setLanguage("PYTHON");
      }
    }
    setStep(2);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleCancel = () => {
    navigate("/projects");
  };

  const handleSubmit = async () => {
    if (!selectedRepository || !user) return;

    try {
      await createProject.mutateAsync({
        repository_url:
          selectedRepository.html_url || selectedRepository.url || "",
        install_command: installCommand,
        build_command: buildCommand,
        run_command: runCommand,
        language: language as Language,
        custom_domain: customDomain || undefined,
        require_db: requireDB,
        migration_command: migrationCommand || undefined,
      });
      navigate("/projects");
    } catch (err) {
      console.error("Failed to create project:", err);
    }
  };

  const handleNextPage = () => {
    if (pagination && currentPage < pagination.total_pages!) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const isFormValid = installCommand && runCommand && language;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Create New Project
          </h1>
          <p className="text-gray-500 mt-2">
            Set up your project for deployment in a few simple steps
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex sm:items-center justify-between sm:flex-row flex-col gap-4">
            {STEPS.map((s, index) => (
              <div key={s.id} className="flex items-center flex-1">
                <div className="flex items-center relative">
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                      step > s.id
                        ? "bg-blue-600 border-blue-600"
                        : step === s.id
                        ? "border-blue-600 bg-white"
                        : "border-gray-300 bg-white"
                    }`}
                  >
                    {step > s.id ? (
                      <Check className="h-5 w-5 text-white" />
                    ) : (
                      <span
                        className={`text-sm font-semibold ${
                          step === s.id ? "text-blue-600" : "text-gray-400"
                        }`}
                      >
                        {s.id}
                      </span>
                    )}
                  </div>
                  <div className="ml-4 min-w-0">
                    <p
                      className={`text-sm font-medium ${
                        step >= s.id ? "text-gray-900" : "text-gray-500"
                      }`}
                    >
                      {s.name}
                    </p>
                    <p className="text-sm text-gray-500">{s.description}</p>
                  </div>
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-4 sm:block hidden ${
                      step > s.id ? "bg-blue-600" : "bg-gray-300"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Main Content Card */}
        <Card className="shadow-lg">
          <CardContent className="p-8">
            {/* Step 1: Repository Selection */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    Select Repository
                  </h2>
                  <p className="text-gray-600">
                    Choose the repository you want to deploy
                  </p>
                </div>

                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search repositories..."
                    value={searchInput}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="pl-9"
                  />
                </div>

                {/* Repository List */}
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-3">
                  {isLoading && (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                    </div>
                  )}

                  {error && (
                    <div className="text-center py-12 text-red-500">
                      Error loading repositories: {error.message}
                    </div>
                  )}

                  {!isLoading && !error && repositories.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      {debouncedSearch
                        ? "No repositories found matching your search"
                        : "No repositories available"}
                    </div>
                  )}

                  {!isLoading &&
                    !error &&
                    repositories.map((repo) => (
                      <Card
                        key={repo.id}
                        className="cursor-pointer transition-all hover:shadow-md hover:border-blue-300"
                        onClick={() => handleRepositorySelect(repo)}
                      >
                        <CardContent className="p-4">
                          <div className="space-y-2">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <h3 className="font-semibold text-lg">
                                    {repo.name}
                                  </h3>
                                  {repo.private && (
                                    <Badge
                                      variant="secondary"
                                      className="text-xs"
                                    >
                                      Private
                                    </Badge>
                                  )}
                                  {repo.fork && (
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      Fork
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600">
                                  {repo.full_name}
                                </p>
                              </div>
                              {repo.language && (
                                <Badge variant="outline">{repo.language}</Badge>
                              )}
                            </div>

                            {repo.description && (
                              <p className="text-sm text-gray-500">
                                {repo.description}
                              </p>
                            )}

                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <Star className="h-3 w-3" />
                                {repo.stars}
                              </span>
                              <span className="flex items-center gap-1">
                                <GitFork className="h-3 w-3" />
                                {repo.forks}
                              </span>
                              <span className="flex items-center gap-1">
                                <Eye className="h-3 w-3" />
                                {repo.watchers}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>

                {/* Pagination */}
                {pagination && pagination.total_pages! > 1 && (
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="text-sm text-gray-500">
                      Page {pagination.page} of {pagination.total_pages} (
                      {pagination.total} total)
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handlePrevPage}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleNextPage}
                        disabled={currentPage === pagination.total_pages!}
                      >
                        Next
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Configuration */}
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    Configure Project
                  </h2>
                  <p className="text-gray-600">
                    Set up your project build and runtime configuration
                  </p>
                </div>

                {/* Selected Repository Info */}
                {selectedRepository && (
                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <GitBranch className="h-4 w-4 text-blue-600" />
                            <span className="font-semibold">
                              {selectedRepository.name}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {selectedRepository.full_name}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setStep(1)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          Change
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Configuration Form */}
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="language">Language/Framework *</Label>
                    <Select value={language} onValueChange={setLanguage}>
                      <SelectTrigger id="language">
                        <SelectValue placeholder="Select language or framework" />
                      </SelectTrigger>
                      <SelectContent>
                        {LANGUAGES.map((lang) => (
                          <SelectItem key={lang.value} value={lang.value}>
                            {lang.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-gray-500">
                      Choose the primary language or framework for your project
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="installCommand">Install Command *</Label>
                    <Input
                      id="installCommand"
                      placeholder="e.g., npm install"
                      value={installCommand}
                      onChange={(e) => setInstallCommand(e.target.value)}
                    />
                    <p className="text-sm text-gray-500">
                      Command to install dependencies
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="buildCommand">
                      Build Command (Optional)
                    </Label>
                    <Input
                      id="buildCommand"
                      placeholder="e.g., npm run build (leave empty if no build step)"
                      value={buildCommand}
                      onChange={(e) => setBuildCommand(e.target.value)}
                    />
                    <p className="text-sm text-gray-500">
                      Command to build your application. Leave empty if your app
                      doesn't need a build step.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="runCommand">Run Command *</Label>
                    <Input
                      id="runCommand"
                      placeholder="e.g., npm start"
                      value={runCommand}
                      onChange={(e) => setRunCommand(e.target.value)}
                    />
                    <p className="text-sm text-gray-500">
                      Command to start your application
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="customDomain">
                      Custom Domain (Optional)
                    </Label>
                    <div className="flex gap-2 items-center">
                      <Input
                        id="customDomain"
                        placeholder="my-app"
                        value={customDomain}
                        onChange={(e) =>
                          setCustomDomain(e.target.value.toLowerCase())
                        }
                        className="flex-1"
                      />
                      <span className="text-sm text-gray-500 whitespace-nowrap">
                        .snapdeploy.app
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      Your app will be available at:{" "}
                      <span className="font-mono">
                        {customDomain || "[auto-generated]"}.snapdeploy.app
                      </span>
                    </p>
                    <p className="text-xs text-gray-400">
                      Leave empty to auto-generate. Use lowercase letters,
                      numbers, and hyphens only.
                    </p>
                  </div>

                  {/* Database Options */}
                  <div className="border-t pt-6 space-y-4">
                    <div className="flex items-center gap-2">
                      <Database className="h-5 w-5 text-blue-600" />
                      <h3 className="text-lg font-semibold">
                        Database Configuration
                      </h3>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="requireDB"
                        checked={requireDB}
                        onCheckedChange={(checked) =>
                          setRequireDB(checked as boolean)
                        }
                      />
                      <Label
                        htmlFor="requireDB"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        Require PostgreSQL Database
                      </Label>
                    </div>
                    <p className="text-sm text-gray-500 ml-6">
                      A fresh PostgreSQL database will be created on each
                      deployment. The database URL will be available as{" "}
                      <span className="font-mono text-xs">DATABASE_URL</span>{" "}
                      environment variable.
                    </p>

                    {requireDB && (
                      <div className="space-y-2 ml-6">
                        <Label htmlFor="migrationCommand">
                          Migration Command (Optional)
                        </Label>
                        <Input
                          id="migrationCommand"
                          placeholder="e.g., npm run migrate"
                          value={migrationCommand}
                          onChange={(e) => setMigrationCommand(e.target.value)}
                        />
                        <p className="text-sm text-gray-500">
                          Command to run database migrations after the database
                          is created. This will run before your app starts.
                        </p>
                        <p className="text-xs text-gray-400">
                          Examples:{" "}
                          <span className="font-mono">npm run migrate</span>,{" "}
                          <span className="font-mono">
                            python manage.py migrate
                          </span>
                          ,{" "}
                          <span className="font-mono">
                            npx prisma migrate deploy
                          </span>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer Actions */}
        <div className="mt-8 flex items-center justify-between">
          <div>
            {step > 1 && (
              <Button variant="outline" onClick={handleBack}>
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            )}
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            {step === 2 && (
              <Button
                onClick={handleSubmit}
                disabled={!isFormValid || createProject.isPending}
              >
                {createProject.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Rocket className="h-4 w-4 mr-2" />
                    Create Project
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
