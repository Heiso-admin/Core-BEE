"use client";

import { Shuffle, Upload, User } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const avatarOptions = {
  avatarStyle: ["Circle", "Transparent"],
  topType: [
    "NoHair",
    "Eyepatch",
    "Hat",
    "Hijab",
    "Turban",
    "WinterHat1",
    "WinterHat2",
    "WinterHat3",
    "WinterHat4",
    "LongHairBigHair",
    "LongHairBob",
    "LongHairBun",
    "LongHairCurly",
    "LongHairCurvy",
    "LongHairDreads",
    "LongHairFrida",
    "LongHairFro",
    "LongHairFroBand",
    "LongHairNotTooLong",
    "LongHairShavedSides",
    "LongHairMiaWallace",
    "LongHairStraight",
    "LongHairStraight2",
    "LongHairStraightStrand",
    "ShortHairDreads01",
    "ShortHairDreads02",
    "ShortHairFrizzle",
    "ShortHairShaggyMullet",
    "ShortHairShortCurly",
    "ShortHairShortFlat",
    "ShortHairShortRound",
    "ShortHairShortWaved",
    "ShortHairSides",
    "ShortHairTheCaesar",
    "ShortHairTheCaesarSidePart",
  ],
  accessoriesType: [
    "Blank",
    "Kurt",
    "Prescription01",
    "Prescription02",
    "Round",
    "Sunglasses",
    "Wayfarers",
  ],
  hairColor: [
    "Auburn",
    "Black",
    "Blonde",
    "BlondeGolden",
    "Brown",
    "BrownDark",
    "PastelPink",
    "Platinum",
    "Red",
    "SilverGray",
  ],
  facialHairType: [
    "Blank",
    "BeardMedium",
    "BeardLight",
    "BeardMajestic",
    "MoustacheFancy",
    "MoustacheMagnum",
  ],
  facialHairColor: [
    "Auburn",
    "Black",
    "Blonde",
    "BlondeGolden",
    "Brown",
    "BrownDark",
    "PastelPink",
    "Platinum",
    "Red",
    "SilverGray",
  ],
  clotheType: [
    "BlazerShirt",
    "BlazerSweater",
    "CollarSweater",
    "GraphicShirt",
    "Hoodie",
    "Overall",
    "ShirtCrewNeck",
    "ShirtScoopNeck",
    "ShirtVNeck",
  ],
  clotheColor: [
    "Black",
    "Blue01",
    "Blue02",
    "Blue03",
    "Gray01",
    "Gray02",
    "Heather",
    "PastelBlue",
    "PastelGreen",
    "PastelOrange",
    "PastelRed",
    "PastelYellow",
    "Pink",
    "Red",
    "White",
  ],
  eyeType: [
    "Close",
    "Cry",
    "Default",
    "Dizzy",
    "EyeRoll",
    "Happy",
    "Hearts",
    "Side",
    "Squint",
    "Surprised",
    "Wink",
    "WinkWacky",
  ],
  eyebrowType: [
    "Angry",
    "AngryNatural",
    "Default",
    "DefaultNatural",
    "FlatNatural",
    "RaisedExcited",
    "RaisedExcitedNatural",
    "SadConcerned",
    "SadConcernedNatural",
    "UnibrowNatural",
    "UpDown",
    "UpDownNatural",
  ],
  mouthType: [
    "Concerned",
    "Default",
    "Disbelief",
    "Eating",
    "Grimace",
    "Sad",
    "ScreamOpen",
    "Serious",
    "Smile",
    "Tongue",
    "Twinkle",
    "Vomit",
  ],
  skinColor: [
    "Tanned",
    "Yellow",
    "Pale",
    "Light",
    "Brown",
    "DarkBrown",
    "Black",
  ],
};

export default function AvatarCreatorDialog() {
  const t = useTranslations("account.avatar");
  const [avatarType, setAvatarType] = useState<"avataaars" | "custom">(
    "avataaars",
  );
  const [avatarSettings, setAvatarSettings] = useState({
    avatarStyle: "Circle",
    topType: "ShortHairTheCaesar",
    accessoriesType: "Prescription02",
    hairColor: "Red",
    facialHairType: "MoustacheMagnum",
    facialHairColor: "Red",
    clotheType: "ShirtScoopNeck",
    clotheColor: "PastelRed",
    eyeType: "Surprised",
    eyebrowType: "RaisedExcitedNatural",
    mouthType: "Smile",
    skinColor: "Light",
  });
  const [customAvatarUrl, setCustomAvatarUrl] = useState("");

  const updateSetting = (key: string, value: string) => {
    setAvatarSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCustomAvatarUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const getAvataaarsUrl = () => {
    const baseUrl = "https://avataaars.io/";
    const params = new URLSearchParams(
      avatarSettings as Record<string, string>,
    );
    return `${baseUrl}?${params.toString()}`;
  };

  const randomizeAvatar = () => {
    const randomSettings = Object.fromEntries(
      Object.entries(avatarOptions).map(([key, options]) => [
        key,
        options[Math.floor(Math.random() * options.length)],
      ]),
    );
    setAvatarSettings(randomSettings as typeof avatarSettings);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">{t("changeAvatar")}</Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("createYourAvatar")}</DialogTitle>
          <DialogDescription>{t("generateOrUpload")}</DialogDescription>
        </DialogHeader>
        <Tabs
          defaultValue="avataaars"
          onValueChange={(value) =>
            setAvatarType(value as "avataaars" | "custom")
          }
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="avataaars">{t("generateAvatar")}</TabsTrigger>
            <TabsTrigger value="custom">{t("uploadImage")}</TabsTrigger>
          </TabsList>
          <TabsContent value="avataaars" className="space-y-4">
            <div className="flex justify-center items-center mb-4 space-x-4">
              <Avatar className="w-48 h-48">
                <AvatarImage
                  src={getAvataaarsUrl()}
                  alt={t("generatedAvatar")}
                />
                <AvatarFallback>
                  <User className="w-24 h-24" />
                </AvatarFallback>
              </Avatar>
              <Button onClick={randomizeAvatar} variant="outline">
                <Shuffle className="mr-2 h-4 w-4" />
                {t("randomize")}
              </Button>
            </div>
            <Card>
              <CardContent className="grid grid-cols-2 gap-4 pt-4">
                {Object.entries(avatarOptions).map(([key, options]) => (
                  <div key={key} className="space-y-2">
                    <Label htmlFor={key}>{t(`options.${key}`)}</Label>
                    <Select
                      value={avatarSettings[key as keyof typeof avatarSettings]}
                      onValueChange={(value) => updateSetting(key, value)}
                    >
                      <SelectTrigger id={key}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {options.map((option: string) => (
                          <SelectItem key={option} value={option}>
                            {t(`options.${key}.${option}`)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="custom" className="space-y-4">
            <div className="flex justify-center mb-4">
              <Avatar className="w-48 h-48">
                <AvatarImage src={customAvatarUrl} alt={t("customAvatar")} />
                <AvatarFallback>
                  <User className="w-24 h-24" />
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="flex items-center justify-center">
              <Label htmlFor="avatar-upload" className="cursor-pointer">
                <div className="flex items-center justify-center w-full h-32 border-2 border-dashed rounded-lg border-gray-300 hover:border-gray-400">
                  <div className="space-y-1 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <span className="relative font-medium text-primary hover:underline focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary">
                        {t("uploadFile")}
                      </span>
                      <p className="pl-1">{t("orDragAndDrop")}</p>
                    </div>
                    <p className="text-xs text-gray-500">{t("fileTypes")}</p>
                  </div>
                </div>
                <Input
                  id="avatar-upload"
                  type="file"
                  className="hidden"
                  onChange={handleFileUpload}
                  accept="image/*"
                />
              </Label>
            </div>
          </TabsContent>
        </Tabs>
        <DialogFooter>
          <Button
            onClick={() =>
              console.log(
                avatarType === "avataaars" ? avatarSettings : customAvatarUrl,
              )
            }
          >
            {t("saveAvatar")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
