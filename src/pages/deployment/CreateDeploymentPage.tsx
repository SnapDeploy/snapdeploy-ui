import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
} from "lucide-react";
import { useCurrentUser, useUserRepositories } from "@/hooks/useApiQueries";
import type { Repository } from "@/lib/api/generated/service";

const STEPS = [
  {
    id: 1,
    name: "Select Repository",
    description: "Choose a repository to deploy",
  },
  { id: 2, name: "Configure", description: "Set deployment options" },
];

export function CreateDeploymentPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedRepository, setSelectedRepository] =
    useState<Repository | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;

  const { data: user } = useCurrentUser();

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setCurrentPage(1); // Reset to first page on new search
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [searchInput]);

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
    setStep(2);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleCancel = () => {
    navigate("/deployments");
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Create New Deployment
          </h1>
          <p className="text-gray-500 mt-2">
            Deploy your application in a few simple steps
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
                    Configure Deployment
                  </h2>
                  <p className="text-gray-600">
                    Set up your deployment configuration
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

                {/* Configuration Form Placeholder */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-12">
                  <div className="text-center text-gray-500">
                    <p className="text-lg font-medium">
                      Deployment configuration form
                    </p>
                    <p className="text-sm mt-2">Coming soon...</p>
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
              <Button disabled>
                Create Deployment
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
