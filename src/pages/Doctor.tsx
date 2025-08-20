import { useState } from "react";
import { Navigation } from "@/components/ui/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Plus, User, Download, Upload } from "lucide-react";
import { CorrectionsTable } from "@/components/doctor/CorrectionsTable";
import { DxTable } from "@/components/doctor/DxTable";
import { RxTable } from "@/components/doctor/RxTable";
import { ProcTable } from "@/components/doctor/ProcTable";

export default function Doctor() {
  const [doctorId, setDoctorId] = useState("");
  const [loadedDoctor, setLoadedDoctor] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const handleLoadDoctor = () => {
    if (doctorId.trim()) {
      // Mock loading doctor data
      setLoadedDoctor({
        id: doctorId,
        name: `Dr. ${doctorId.charAt(0).toUpperCase() + doctorId.slice(1)}`
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 space-y-6">
        <Navigation />
        
        {/* Doctor Loading Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5 text-primary" />
              <span>Doctor Management</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end space-x-4">
              <div className="flex-1 space-y-2">
                <Label htmlFor="doctorId">Doctor ID</Label>
                <Input
                  id="doctorId"
                  placeholder="Enter doctor ID (e.g., johnson, chen, rodriguez)"
                  value={doctorId}
                  onChange={(e) => setDoctorId(e.target.value)}
                />
              </div>
              <Button onClick={handleLoadDoctor} disabled={!doctorId.trim()}>
                Load Doctor
              </Button>
            </div>
            
            {loadedDoctor && (
              <div className="mt-4 p-4 bg-secondary rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-foreground">{loadedDoctor.name}</h3>
                    <p className="text-sm text-muted-foreground">ID: {loadedDoctor.id}</p>
                  </div>
                  <Badge variant="outline" className="text-medical-success border-medical-success">
                    Loaded
                  </Badge>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {loadedDoctor && (
          <Card>
            <CardContent className="p-0">
              <Tabs defaultValue="corrections" className="w-full">
                <div className="px-6 pt-6">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="corrections">Auto-Corrections</TabsTrigger>
                    <TabsTrigger value="diagnoses">Diagnoses (ICD-10)</TabsTrigger>
                    <TabsTrigger value="drugs">Drugs (Rx)</TabsTrigger>
                    <TabsTrigger value="procedures">Procedures (CPT)</TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="corrections" className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Auto-Correction Rules</h3>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Upload className="h-4 w-4 mr-2" />
                        Import CSV
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Export CSV
                      </Button>
                    </div>
                  </div>
                  <CorrectionsTable doctorId={loadedDoctor.id} />
                </TabsContent>

                <TabsContent value="diagnoses" className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Favorite ICD-10 Diagnoses</h3>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Upload className="h-4 w-4 mr-2" />
                        Import CSV
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Export CSV
                      </Button>
                    </div>
                  </div>
                  <DxTable doctorId={loadedDoctor.id} />
                </TabsContent>

                <TabsContent value="drugs" className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Favorite Medications</h3>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Upload className="h-4 w-4 mr-2" />
                        Import CSV
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Export CSV
                      </Button>
                    </div>
                  </div>
                  <RxTable doctorId={loadedDoctor.id} />
                </TabsContent>

                <TabsContent value="procedures" className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Favorite CPT Procedures</h3>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Upload className="h-4 w-4 mr-2" />
                        Import CSV
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Export CSV
                      </Button>
                    </div>
                  </div>
                  <ProcTable doctorId={loadedDoctor.id} />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}